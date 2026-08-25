package com.wwwlnyy.x2026UnithonScrapApp

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.wwwlnyy.appgroupstorage.KEY_ACCESS_TOKEN
import com.wwwlnyy.appgroupstorage.PREFS_NAME
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

private const val MINIMUM_RESULT_VISIBLE_DURATION_MS = 500L
private const val SCRAP_ENDPOINT = "https://ai-image-api.fly.dev/scrap"

class ShareReceiverActivity : AppCompatActivity() {
  private var statusLabel: TextView? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_share_receiver)
    statusLabel = findViewById(R.id.shareReceiverLabel)

    val sharedText = intent?.getStringExtra(Intent.EXTRA_TEXT)
    if (sharedText.isNullOrBlank()) {
      finishWithStatus("링크만 저장할 수 있어요")
      return
    }

    scrapUrl(sharedText)
  }

  private fun scrapUrl(urlString: String) {
    val accessToken = getSharedPreferences(PREFS_NAME, 0).getString(KEY_ACCESS_TOKEN, null)
    Log.d("ShareReceiverActivity", "accessToken present=${!accessToken.isNullOrBlank()} url=$urlString")
    if (accessToken.isNullOrBlank()) {
      finishWithStatus("로그인이 필요해요")
      return
    }

    val startTime = System.currentTimeMillis()
    Thread {
      val statusText = try {
        val connection = URL(SCRAP_ENDPOINT).openConnection() as HttpURLConnection
        connection.requestMethod = "POST"
        connection.setRequestProperty("Content-Type", "application/json")
        connection.setRequestProperty("Authorization", "Bearer $accessToken")
        connection.doOutput = true
        connection.connectTimeout = 10_000
        connection.readTimeout = 10_000

        OutputStreamWriter(connection.outputStream).use { writer ->
          writer.write(JSONObject().put("url", urlString).toString())
        }

        val statusCode = connection.responseCode
        Log.d("ShareReceiverActivity", "statusCode=$statusCode")
        connection.disconnect()

        when {
          statusCode in 200..299 -> "저장 완료"
          statusCode == 401 -> "로그인이 만료됐어요"
          else -> "저장 실패했어요"
        }
      } catch (error: Exception) {
        Log.e("ShareReceiverActivity", "scrapUrl failed", error)
        "저장 실패했어요"
      }

      runOnUiThread { finishWithStatus(statusText, startTime) }
    }.start()
  }

  private fun finishWithStatus(statusText: String, minimumStartTime: Long? = null) {
    statusLabel?.text = statusText
    val elapsed = minimumStartTime?.let { System.currentTimeMillis() - it } ?: 0L
    val remainingDelay = maxOf(0L, MINIMUM_RESULT_VISIBLE_DURATION_MS - elapsed)
    Handler(Looper.getMainLooper()).postDelayed({
      finish()
      overridePendingTransition(0, 0)
    }, remainingDelay)
  }
}
