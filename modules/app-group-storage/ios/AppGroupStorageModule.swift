import ExpoModulesCore

public class AppGroupStorageModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AppGroupStorage")

    Function("setAccessToken") { (accessToken: String?) in
      guard let appGroup = Bundle.main.object(forInfoDictionaryKey: "AppGroup") as? String,
            let defaults = UserDefaults(suiteName: appGroup) else {
        return
      }
      if let accessToken = accessToken {
        defaults.set(accessToken, forKey: "accessToken")
      } else {
        defaults.removeObject(forKey: "accessToken")
      }
    }
  }
}
