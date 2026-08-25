package com.wwwlnyy.appgroupstorage

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Android has no App Group concept — ShareReceiverActivity runs in the same
// process/package as the main app, so a private SharedPreferences file is
// enough to hand the access token across (see PREFS_NAME/KEY_ACCESS_TOKEN,
// read by ShareReceiverActivity.kt).
const val PREFS_NAME = "app_group_storage"
const val KEY_ACCESS_TOKEN = "accessToken"

class AppGroupStorageModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AppGroupStorage")

    Function("setAccessToken") { accessToken: String? ->
      val prefs = appContext.reactContext?.getSharedPreferences(PREFS_NAME, 0) ?: return@Function
      prefs.edit().apply {
        if (accessToken != null) {
          putString(KEY_ACCESS_TOKEN, accessToken)
        } else {
          remove(KEY_ACCESS_TOKEN)
        }
      }.apply()
    }
  }
}
