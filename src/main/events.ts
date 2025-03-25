export enum AppEvents {
  // Window Management
  WINDOW_MINIMIZE = 'window:minimize',
  WINDOW_MAXIMIZE = 'window:maximize',
  WINDOW_RESTORE = 'window:restore',
  WINDOW_CLOSE = 'window:close',

  // File Operations
  FILE_UPLOAD = 'file:upload',
  FILE_DOWNLOAD = 'file:download',

  // Video Recording
  VIDEO_START = 'video:start',
  VIDEO_STOP = 'video:stop',
  VIDEO_PAUSE = 'video:pause',
  VIDEO_RESUME = 'video:resume',

  // Authentication
  AUTHENTICATION_SUCCESS = 'authentication:success',
  AUTHENTICATION_FAILURE = 'authentication:failure',

  SET_PRESET = 'set:preset'
}
