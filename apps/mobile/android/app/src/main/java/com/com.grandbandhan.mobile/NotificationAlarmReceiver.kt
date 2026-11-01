package com.grandbandhan.mobile

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class NotificationAlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val id = intent.getIntExtra("id", 0)
        val title = intent.getStringExtra("title") ?: "Grand Bandhan Alert"
        val message = intent.getStringExtra("message") ?: "Upcoming wedding milestone checkpoint."
        val channelId = intent.getStringExtra("channelId") ?: NotificationHelper.CHANNEL_GENERAL
        val deepLinkUri = intent.getStringExtra("deepLinkUri")
        val dataJson = intent.getStringExtra("dataJson")

        NotificationHelper.createDefaultChannels(context)
        NotificationHelper.showNotification(
            context = context,
            notificationId = id,
            title = title,
            message = message,
            channelId = channelId,
            deepLinkUri = deepLinkUri,
            dataJson = dataJson
        )
    }
}
