import UIKit
import AVFoundation
import UniformTypeIdentifiers

// Keeps the status card visible for at least this long after a result is known,
// so a near-instant response doesn't read as a frozen/flickering screen.
private let minimumResultVisibleDuration: TimeInterval = 0.5

private let scrapEndpoint = URL(string: "https://ai-image-api.fly.dev/scrap")!

class ShareExtensionViewController: UIViewController {
  private var statusLabel: UILabel?

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = UIColor.black.withAlphaComponent(0.25)
    setupStatusCard()

    getShareData { [weak self] sharedItems in
      guard let self = self else { return }
      guard let urlString = sharedItems?["url"] as? String else {
        self.finish(statusText: "링크만 저장할 수 있어요")
        return
      }
      self.scrapUrl(urlString)
    }
  }

  private func scrapUrl(_ urlString: String) {
    guard let appGroup = Bundle.main.object(forInfoDictionaryKey: "AppGroup") as? String,
          let accessToken = UserDefaults(suiteName: appGroup)?.string(forKey: "accessToken") else {
      finish(statusText: "로그인이 필요해요")
      return
    }

    var request = URLRequest(url: scrapEndpoint)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
    request.httpBody = try? JSONSerialization.data(withJSONObject: ["url": urlString])

    let startTime = Date()
    URLSession.shared.dataTask(with: request) { [weak self] _, response, error in
      let statusCode = (response as? HTTPURLResponse)?.statusCode
      let succeeded = error == nil && statusCode.map { (200..<300).contains($0) } ?? false
      let statusText: String
      if succeeded {
        statusText = "저장 완료"
      } else if statusCode == 401 {
        statusText = "로그인이 만료됐어요"
      } else {
        statusText = "저장 실패했어요"
      }
      DispatchQueue.main.async {
        self?.finish(statusText: statusText, minimumStartTime: startTime)
      }
    }.resume()
  }

  private func finish(statusText: String, minimumStartTime: Date? = nil) {
    statusLabel?.text = statusText
    let elapsed = minimumStartTime.map { Date().timeIntervalSince($0) } ?? 0
    let remainingDelay = max(0, minimumResultVisibleDuration - elapsed)
    DispatchQueue.main.asyncAfter(deadline: .now() + remainingDelay) { [weak self] in
      self?.close()
    }
  }

  func close() {
    self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
  }

  private func setupStatusCard() {
    let card = UIView()
    card.backgroundColor = .systemBackground
    card.layer.cornerRadius = 16
    card.translatesAutoresizingMaskIntoConstraints = false
    view.addSubview(card)

    NSLayoutConstraint.activate([
      card.centerXAnchor.constraint(equalTo: view.centerXAnchor),
      card.centerYAnchor.constraint(equalTo: view.centerYAnchor),
      card.widthAnchor.constraint(equalToConstant: 160),
    ])

    let spinner = UIActivityIndicatorView(style: .medium)
    spinner.startAnimating()

    let label = UILabel()
    label.text = "저장 중..."
    label.font = .systemFont(ofSize: 15, weight: .semibold)
    label.textColor = .label
    label.textAlignment = .center
    statusLabel = label

    let stack = UIStackView(arrangedSubviews: [spinner, label])
    stack.axis = .vertical
    stack.spacing = 12
    stack.alignment = .center
    stack.translatesAutoresizingMaskIntoConstraints = false
    card.addSubview(stack)

    NSLayoutConstraint.activate([
      stack.topAnchor.constraint(equalTo: card.topAnchor, constant: 24),
      stack.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -24),
      stack.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 20),
      stack.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -20),
    ])
  }

  private func getShareData(completion: @escaping ([String: Any]?) -> Void) {
    guard let extensionItems = extensionContext?.inputItems as? [NSExtensionItem] else {
      completion(nil)
      return
    }

    var sharedItems: [String: Any] = [:]

    let group = DispatchGroup()

    let fileManager = FileManager.default

    for item in extensionItems {
      for provider in item.attachments ?? [] {
        if provider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
          group.enter()
          provider.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { (urlItem, error) in
            DispatchQueue.main.async {
              if let sharedURL = urlItem as? URL {
                if sharedURL.isFileURL {
                  // Screenshot overlay sends public.url (file URLs) instead of public.image
                  let fileExtension = sharedURL.pathExtension.lowercased()
                  let imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "tiff", "tif", "heic", "heif", "webp"]
                  var isImage = imageExtensions.contains(fileExtension)

                  if !isImage, let resourceValues = try? sharedURL.resourceValues(forKeys: [.typeIdentifierKey]),
                     let typeIdentifier = resourceValues.typeIdentifier {
                    isImage = UTType(typeIdentifier)?.conforms(to: .image) ?? false
                  }

                  guard let appGroup = Bundle.main.object(forInfoDictionaryKey: "AppGroup") as? String else {
                    print("Could not find AppGroup in info.plist")
                    group.leave()
                    return
                  }

                  guard let containerUrl = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroup) else {
                    print("Could not set up file manager container URL for app group")
                    group.leave()
                    return
                  }

                  let tempFilePath = sharedURL.path
                  let fileName = sharedURL.lastPathComponent

                  let sharedDataUrl = containerUrl.appendingPathComponent("sharedData")

                  if !fileManager.fileExists(atPath: sharedDataUrl.path) {
                    do {
                      try fileManager.createDirectory(at: sharedDataUrl, withIntermediateDirectories: true)
                    } catch {
                      print("Failed to create sharedData directory: \(error)")
                    }
                  }

                  let persistentURL = sharedDataUrl.appendingPathComponent(fileName)

                  do {
                    try fileManager.copyItem(atPath: tempFilePath, toPath: persistentURL.path)
                    let key = isImage ? "images" : "files"
                    if sharedItems[key] == nil {
                      sharedItems[key] = [String]()
                    }
                    if var array = sharedItems[key] as? [String] {
                      array.append(persistentURL.absoluteString)
                      sharedItems[key] = array
                    }
                  } catch {
                    print("Failed to copy file: \(error)")
                  }
                } else {
                  sharedItems["url"] = sharedURL.absoluteString
                }
              }
              group.leave()
            }
          }
        }

        // Only check for plain text if no URL was found
        if !provider.hasItemConformingToTypeIdentifier(UTType.url.identifier) && provider.hasItemConformingToTypeIdentifier(UTType.text.identifier) {
          group.enter()
          provider.loadItem(forTypeIdentifier: UTType.text.identifier, options: nil) { (textItem, error) in
            DispatchQueue.main.async {
              if let text = textItem as? String {
                sharedItems["text"] = text
              }
              group.leave()
            }
          }
        }
      }
    }

    group.notify(queue: .main) {
      completion(sharedItems.isEmpty ? nil : sharedItems)
    }
  }
}
