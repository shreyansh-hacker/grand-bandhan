package com.grandbandhan.mobile

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

object NotificationHelper {

    const val CHANNEL_VERIFICATIONS = "gb_verifications"
    const val CHANNEL_MILESTONES = "gb_milestones"
    const val CHANNEL_PAYMENTS = "gb_payments"
    const val CHANNEL_GENERAL = "gb_general"

    private const val IMPERIAL_GOLD_COLOR = 0xD4A853

    /**
     * Pre-create imperial notification channels on Android 8.0+ (API 26+)
     */
    fun createDefaultChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return

            val channels = listOf(
                NotificationChannel(
                    CHANNEL_VERIFICATIONS,
                    "Service Verifications & Escalations",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Time-critical on-ground wedding service verifications and coordinator escalations."
                    enableLights(true)
                    lightColor = Color.rgb(212, 168, 83)
                    enableVibration(true)
                    vibrationPattern = longArrayOf(0, 300, 150, 300)
                    lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
                },
                NotificationChannel(
                    CHANNEL_MILESTONES,
                    "Wedding Milestones & Timeline",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Key ceremony start alerts, vendor arrival radars, and wedding schedule changes."
                    enableLights(true)
                    lightColor = Color.rgb(212, 168, 83)
                    enableVibration(true)
                    lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
                },
                NotificationChannel(
                    CHANNEL_PAYMENTS,
                    "Payments & Escrow Reminders",
                    NotificationManager.IMPORTANCE_DEFAULT
                ).apply {
                    description = "Upcoming client milestone due dates and vendor payout verifications."
                },
                NotificationChannel(
                    CHANNEL_GENERAL,
                    "General Concierge Updates",
                    NotificationManager.IMPORTANCE_DEFAULT
                ).apply {
                    description = "General operational notices and task board updates."
                }
            )

            channels.forEach { manager.createNotificationChannel(it) }
        }
    }

    /**
     * Build and display a notification in the Android system tray
     */
    fun showNotification(
        context: Context,
        notificationId: Int,
        title: String,
        message: String,
        channelId: String = CHANNEL_GENERAL,
        deepLinkUri: String? = null,
        dataJson: String? = null
    ) {
        val managerCompat = NotificationManagerCompat.from(context)
        if (!managerCompat.areNotificationsEnabled()) {
            return
        }

        // Target MainActivity for deep link action
        val launchIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            deepLinkUri?.let { putExtra("deepLinkUri", it) }
            dataJson?.let { putExtra("notificationData", it) }
            putExtra("notificationId", notificationId)
        }

        val pendingIntentFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            notificationId,
            launchIntent,
            pendingIntentFlags
        )

        val targetChannel = when (channelId) {
            CHANNEL_VERIFICATIONS, CHANNEL_MILESTONES, CHANNEL_PAYMENTS -> channelId
            else -> CHANNEL_GENERAL
        }

        val isVerification = targetChannel == CHANNEL_VERIFICATIONS
        val isCritical = isVerification || targetChannel == CHANNEL_MILESTONES

        val builder = NotificationCompat.Builder(context, targetChannel)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setColor(IMPERIAL_GOLD_COLOR)
            .setAutoCancel(true)
            .setOngoing(isVerification) // Pinned in notification center until resolved
            .setContentIntent(pendingIntent)
            .setPriority(if (isCritical) NotificationCompat.PRIORITY_MAX else NotificationCompat.PRIORITY_DEFAULT)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)

        try {
            managerCompat.notify(notificationId, builder.build())
        } catch (e: SecurityException) {
            // Android 13 POST_NOTIFICATIONS runtime permission not granted
        }
    }
}
