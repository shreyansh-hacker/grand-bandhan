package com.grandbandhan.mobile

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import org.json.JSONArray
import org.json.JSONObject

class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        if (action != Intent.ACTION_BOOT_COMPLETED && action != Intent.ACTION_MY_PACKAGE_REPLACED) {
            return
        }

        NotificationHelper.createDefaultChannels(context)

        val prefs = context.getSharedPreferences("gb_scheduled_notifications", Context.MODE_PRIVATE)
        val rawJson = prefs.getString("schedules", "[]") ?: "[]"

        try {
            val array = JSONArray(rawJson)
            val now = System.currentTimeMillis()
            val remainingArray = JSONArray()

            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
            val canScheduleExact = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                alarmManager.canScheduleExactAlarms()
            } else {
                true
            }

            for (i in 0 until array.length()) {
                val item = array.getJSONObject(i)
                val targetEpochMs = item.optLong("timestampMs", 0L)
                val idStr = item.optString("id", "")
                val numericId = idStr.hashCode()

                // Keep future schedules
                if (targetEpochMs > now) {
                    val alarmIntent = Intent(context, NotificationAlarmReceiver::class.java).apply {
                        putExtra("id", numericId)
                        putExtra("stringId", idStr)
                        putExtra("title", item.optString("title", "Grand Bandhan Alert"))
                        putExtra("message", item.optString("message", ""))
                        putExtra("channelId", item.optString("channelId", NotificationHelper.CHANNEL_GENERAL))
                        if (item.has("deepLinkUri")) {
                            putExtra("deepLinkUri", item.optString("deepLinkUri"))
                        }
                        if (item.has("dataJson")) {
                            putExtra("dataJson", item.optString("dataJson"))
                        }
                    }

                    val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    } else {
                        PendingIntent.FLAG_UPDATE_CURRENT
                    }

                    val pendingIntent = PendingIntent.getBroadcast(
                        context,
                        numericId,
                        alarmIntent,
                        flags
                    )

                    try {
                        if (canScheduleExact) {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                alarmManager.setExactAndAllowWhileIdle(
                                    AlarmManager.RTC_WAKEUP,
                                    targetEpochMs,
                                    pendingIntent
                                )
                            } else {
                                alarmManager.setExact(
                                    AlarmManager.RTC_WAKEUP,
                                    targetEpochMs,
                                    pendingIntent
                                )
                            }
                        } else {
                            // Documented fallback for devices without exact alarm permission
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                alarmManager.setAndAllowWhileIdle(
                                    AlarmManager.RTC_WAKEUP,
                                    targetEpochMs,
                                    pendingIntent
                                )
                            } else {
                                alarmManager.set(
                                    AlarmManager.RTC_WAKEUP,
                                    targetEpochMs,
                                    pendingIntent
                                )
                            }
                        }
                        remainingArray.put(item)
                    } catch (se: SecurityException) {
                        // Fallback inexact if exact schedule is rejected
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                            alarmManager.setAndAllowWhileIdle(
                                AlarmManager.RTC_WAKEUP,
                                targetEpochMs,
                                pendingIntent
                            )
                        }
                        remainingArray.put(item)
                    }
                }
            }

            prefs.edit().putString("schedules", remainingArray.toString()).apply()
        } catch (e: Exception) {
            // Protect against corrupted SharedPreferences data
        }
    }
}
