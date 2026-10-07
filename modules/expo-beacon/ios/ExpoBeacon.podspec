Pod::Spec.new do |s|
  s.name           = 'ExpoBeacon'
  s.version        = '0.1.0'
  s.summary        = 'iOS CoreLocation iBeacon ranging'
  s.description    = 'Local Expo module that ranges iBeacons via CLLocationManager'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'CoreLocation'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
