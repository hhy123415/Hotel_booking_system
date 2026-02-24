export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/hotel-detail/index',
    'pages/hotel-list/index',
    'pages/login/index',
    'pages/register/index',
    'pages/user-center/index',
    'pages/profile-edit/index',
    'pages/order-create/index',
    'pages/order-list/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
  },
  // 声明需要使用的隐私接口，getLocation 属于隐私 API，必须在这里声明后才能正常调用
  requiredPrivateInfos: ['getLocation'],
  // 老版本权限提示配置，仍然建议加上，提升用户理解
  permission: {
    'scope.userLocation': {
      desc: '用于为您推荐附近的酒店与城市',
    },
  },
})
