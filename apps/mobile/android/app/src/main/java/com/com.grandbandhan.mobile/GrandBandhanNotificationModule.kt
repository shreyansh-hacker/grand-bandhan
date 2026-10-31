package com.grandbandhan.mobile

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.*
import org.json.JSONArray
import org.json.JSONObject

class GrandBandhanNotificationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "GrandBandhanNotification"

    init {
        NotificationHelper.createDefaultChannels(reactContext)
    }

    private val prefs by lazy {
        reactContext.getSharedPreferences("gb_scheduled_notifications", Context.MODE_PRIVATE)
    }

    private val alarmManager by lazy {
        reactContext.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
    }

    @ReactMethod
    fun checkPermissions(promise: Promise) {
        val manager = NotificationManagerCompat.from(reactContext)
        val notificationsEnabled = manager.areNotificationsEnabled()

        val exactAlarmGranted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            alarmManager?.canScheduleExactAlarms() ?: false
        } else {
            true
        }

        val map = Arguments.createMap().apply {
            putBoolean("notificationsEnabled", notificationsEnabled)
            putBoolean("exactAlarmGranted", exactAlarmGranted)
            putInt("sdkInt", Build.VERSION.SDK_INT)
        }
        promise.resolve(map)
    }

    @ReactMethod
    fun requestExactAlarmPermission(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val isGranted = alarmManager?.canScheduleExactAlarms() ?: false
            if (!isGranted) {
                try {
                    val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    reactContext.startActivity(intent)
                    promise.resolve(false)
                    return
                } catch (e: Exception) {
                    promise.reject("PERMISSION_ERROR", e.message)
                    return
                }
            }
        }
        promise.resolve(true)
    }

    @ReactMethod
    fun displayNotification(options: ReadableMap, promise: Promise) {
        try {
            val id = options.getString("id") ?: "test_${System.currentTimeMillis()}"
            val title = options.getString("title") ?: "Grand Bandhan"
            val message = options.getString("message") ?: ""
            val channelId = options.getString("channelId") ?: NotificationHelper.CHANNEL_GENERAL
            val deepLinkUri = if (options.hasKey("deepLinkUri")) options.getString("deepLinkUri") else null
            val dataJson = if (options.hasKey("dataJson")) options.getString("dataJson") else null

            val numericId = id.hashCode()
            NotificationHelper.showNotification(
                context = reactContext,
                notificationId = numericId,
                title = title,
                message = message,
                channelId = channelId,
                deepLinkUri = deepLinkUri,
                dataJson = dataJson
            )
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("DISPLAY_ERROR", e.message)
        }
    }

    @ReactMethod
    fun scheduleNotification(options: ReadableMap, promise: Promise) {
        try {
            val id = options.getString("id") ?: run {
                promise.reject("INVALID_ID", "Notification id is required")
                return
            }
            val title = options.getString("title") ?: "Grand Bandhan Alert"
            val message = options.getString("message") ?: ""
            val timestampMs = options.getDouble("timestampMs").toLong()
            val channelId = options.getString("channelId") ?: NotificationHelper.CHANNEL_GENERAL
            val deepLinkUri = if (options.hasKey("deepLinkUri")) options.getString("deepLinkUri") else null
            val dataJson = if (options.hasKey("dataJson")) options.getString("dataJson") else null

            val now = System.currentTimeMillis()
            if (timestampMs <= now) {
                // Already passed, show immediately
                NotificationHelper.showNotification(
                    context = reactContext,
                    notificationId = id.hashCode(),
                    title = title,
                    message = message,
                    channelId = channelId,
                    deepLinkUri = deepLinkUri,
                    dataJson = dataJson
                )
                val result = Arguments.createMap().apply {
                    putBoolean("success", true)
                    putBoolean("firedImmediately", true)
                }
                promise.resolve(result)
                return
            }

            val numericId = id.hashCode()
            val alarmIntent = Intent(reactContext, NotificationAlarmReceiver::class.java).apply {
                putExtra("id", numericId)
                putExtra("stringId", id)
                putExtra("title", title)
                putExtra("message", message)
                putExtra("channelId", channelId)
                deepLinkUri?.let { putExtra("deepLinkUri", it) }
                dataJson?.let { putExtra("dataJson", it) }
            }

            val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            } else {
                PendingIntent.FLAG_UPDATE_CURRENT
            }

            val pendingIntent = PendingIntent.getBroadcast(
                reactContext,
                numericId,
                alarmIntent,
                flags
            )

            val canScheduleExact = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                alarmManager?.canScheduleExactAlarms() ?: false
            } else {
                true
            }

            var usedExact = false
            if (canScheduleExact) {
                try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        alarmManager?.setExactAndAllowWhileIdle(
                            AlarmManager.RTC_WAKEUP,
                            timestampMs,
                            pendingIntent
                        )
                    } else {
                        alarmManager?.setExact(
                            AlarmManager.RTC_WAKEUP,
                            timestampMs,
                            pendingIntent
                        )
                    }
                    usedExact = true
                } catch (se: SecurityException) {
                    // Fallback to inexact alarm if security check fails
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        alarmManager?.setAndAllowWhileIdle(
                            AlarmManager.RTC_WAKEUP,
                            timestampMs,
                            pendingIntent
                        )
                    }
                }
            } else {
                // Inexact documented fallback
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager?.setAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        timestampMs,
                        pendingIntent
                    )
                } else {
                    alarmManager?.set(
                        AlarmManager.RTC_WAKEUP,
                        timestampMs,
                        pendingIntent
                    )
                }
            }

            // Persist to SharedPreferences for device reboot recovery
            val rawJson = prefs.getString("schedules", "[]") ?: "[]"
            val array = JSONArray(rawJson)
            val updatedArray = JSONArray()

            // Remove any existing entry with identical ID to prevent duplicate alarms
            for (i in 0 until array.length()) {
                val item = array.getJSONObject(i)
                if (item.optString("id") != id) {
                    updatedArray.put(item)
                }
            }

            val newRecord = JSONObject().apply {
                put("id", id)
                put("title", title)
                put("message", message)
                put("timestampMs", timestampMs)
                put("channelId", channelId)
                deepLinkUri?.let { put("deepLinkUri", it) }
                dataJson?.let { put("dataJson", it) }
            }
            updatedArray.put(newRecord)
            prefs.edit().putString("schedules", updatedArray.toString()).apply()

            val result = Arguments.createMap().apply {
                putBoolean("success", true)
                putBoolean("exact", usedExact)
                putDouble("timestampMs", timestampMs.toDouble())
                putString("id", id)
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("SCHEDULE_ERROR", e.message)
        }
    }

    @ReactMethod
    fun cancelNotification(id: String, promise: Promise) {
        try {
            val numericId = id.hashCode()
            val alarmIntent = Intent(reactContext, NotificationAlarmReceiver::class.java)
            val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            } else {
                PendingIntent.FLAG_UPDATE_CURRENT
            }
            val pendingIntent = PendingIntent.getBroadcast(
                reactContext,
                numericId,
                alarmIntent,
                flags
            )
            alarmManager?.cancel(pendingIntent)
            pendingIntent.cancel()

            // Remove from SharedPreferences
            val rawJson = prefs.getString("schedules", "[]") ?: "[]"
            val array = JSONArray(rawJson)
            val updatedArray = JSONArray()
            for (i in 0 until array.length()) {
                val item = array.getJSONObject(i)
                if (item.optString("id") != id) {
                    updatedArray.put(item)
                }
            }
            prefs.edit().putString("schedules", updatedArray.toString()).apply()

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CANCEL_ERROR", e.message)
        }
    }

    @ReactMethod
    fun cancelAllNotifications(promise: Promise) {
        try {
            val rawJson = prefs.getString("schedules", "[]") ?: "[]"
            val array = JSONArray(rawJson)
            val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            } else {
                PendingIntent.FLAG_UPDATE_CURRENT
            }

            for (i in 0 until array.length()) {
                val item = array.getJSONObject(i)
                val numericId = item.optString("id").hashCode()
                val alarmIntent = Intent(reactContext, NotificationAlarmReceiver::class.java)
                val pendingIntent = PendingIntent.getBroadcast(
                    reactContext,
                    numericId,
                    alarmIntent,
                    flags
                )
                alarmManager?.cancel(pendingIntent)
                pendingIntent.cancel()
            }

            prefs.edit().putString("schedules", "[]").apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CANCEL_ALL_ERROR", e.message)
        }
    }

    @ReactMethod
    fun getScheduledNotifications(promise: Promise) {
        try {
            val rawJson = prefs.getString("schedules", "[]") ?: "[]"
            val array = JSONArray(rawJson)
            val writableArray = Arguments.createArray()

            for (i in 0 until array.length()) {
                val item = array.getJSONObject(i)
                val map = Arguments.createMap().apply {
                    putString("id", item.optString("id"))
                    putString("title", item.optString("title"))
                    putString("message", item.optString("message"))
                    putDouble("timestampMs", item.optLong("timestampMs").toDouble())
                    putString("channelId", item.optString("channelId"))
                    if (item.has("deepLinkUri")) putString("deepLinkUri", item.optString("deepLinkUri"))
                    if (item.has("dataJson")) putString("dataJson", item.optString("dataJson"))
                }
                writableArray.pushMap(map)
            }
            promise.resolve(writableArray)
        } catch (e: Exception) {
            promise.reject("GET_SCHEDULES_ERROR", e.message)
        }
    }

    @ReactMethod
    fun getInitialNotification(promise: Promise) {
        val currentActivity = currentActivity
        if (currentActivity != null) {
            val intent = currentActivity.intent
            if (intent != null && (intent.hasExtra("deepLinkUri") || intent.hasExtra("notificationData"))) {
                val map = Arguments.createMap().apply {
                    if (intent.hasExtra("deepLinkUri")) putString("deepLinkUri", intent.getStringExtra("deepLinkUri"))
                    if (intent.hasExtra("notificationData")) putString("notificationData", intent.getStringExtra("notificationData"))
                    if (intent.hasExtra("notificationId")) putInt("notificationId", intent.getIntExtra("notificationId", 0))
                }
                // Clear extras so it is not consumed multiple times
                intent.removeExtra("deepLinkUri")
                intent.removeExtra("notificationData")
                promise.resolve(map)
                return
            }
        }
        promise.resolve(null)
    }
}
