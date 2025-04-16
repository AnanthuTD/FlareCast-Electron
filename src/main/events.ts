export enum AppEvents {
  // Window Management
  WINDOW_CLOSE = 'window:close',
  OPEN_WEBPAGE = 'open:webpage',

  // Authentication
  AUTHENTICATION_SUCCESS = 'authentication:success',
  AUTHENTICATION_FAILURE = 'authentication:failure',
  GET_ACCESS_TOKEN = 'get:access:token',
  GET_REFRESH_TOKEN = 'get:refresh:token',
  STORE_TOKENS = 'store:tokens',
  CLEAR_TOKENS = 'clear:tokens',

  SET_PRESET = 'set:preset',

  // media
  GET_SOURCES = 'get:sources',
  GET_SCREEN_CAPTURE = 'get:screen:capture',
  SEND_MEDIA_SOURCES = 'media:sources',

  // STUDIO
  OPEN_STUDIO = 'open:studio',
  HIDE_STUDIO_WINDOW = 'hide:plugin',
  PROFILE_RECEIVED = 'profile:received',
  RESIZE_STUDIO = 'resize:studio',

  // WEBCAM
  OPEN_WEBCAM = 'open:webcam',
  WEBCAM_ON_CHANGE = 'webcam:on:change',
  WEBCAM_CHANGE = 'webcam:change',

  // RTMP (live stream)
  START_STREAM = 'start:rtmp:stream',
  SEND_VIDEO_CHUNK = 'send:video:chunk',
  STOP_STREAM = 'stop:stream'
}
