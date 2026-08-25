package com.wwwlnyy.x2026UnithonScrapApp

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.appcompat.app.AppCompatActivity

private const val AUTO_CLOSE_DELAY_MS = 700L

class ShareReceiverActivity : AppCompatActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_share_receiver)

    val sharedText = intent?.getStringExtra(Intent.EXTRA_TEXT)
    // TODO: App Group과 동일한 역할의 공유 저장소(SharedPreferences/파일)에 sharedText 기록
    // → 메인 앱이 다음 실행 시 읽어서 목록에 반영 (백엔드 연동 전까지 미구현)

    Handler(Looper.getMainLooper()).postDelayed({
      finish()
      overridePendingTransition(0, 0)
    }, AUTO_CLOSE_DELAY_MS)
  }
}
