// The iOS share extension UI is implemented natively in Swift
// (ios/2026UnithonScrapAppShareExtension/ShareExtensionViewController.swift) — it no longer
// loads a JS bundle. This stub only exists so Xcode's "Bundle React Native code and images"
// build phase for the ShareExtension target has an entry file to resolve.
import { AppRegistry } from 'react-native';

AppRegistry.registerComponent('shareExtension', () => () => null);
