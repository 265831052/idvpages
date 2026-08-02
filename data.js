window.MAP_GUIDE_DATA = [
  {
    id: "mirror-harbor",
    image: "assets/maps/real/real-01.png",
    name: "地图 01",
    type: "横杠—",
    difficulty: "噩梦",
    badge: "示例",
    accent: "#d8a24a",
    description: "开阔水域与集装箱区交错，码头灯柱和货箱是判断方向的重要线索。",
    traits: ["水面反光", "集装箱", "双出口", "灯光密集"],
    landmarks: ["中央灯塔", "废弃仓库", "停靠船台"],
    points: [
      { label: "出生点", note: "北岸仓库与南侧货柜之间常见出生" },
      { label: "密码机区", note: "仓库内侧和船台外围比较集中" },
      { label: "逃生门", note: "东南灯柱旁与西侧栅栏外" }
    ],
    items: ["工具箱", "信号枪", "橄榄球"],
    route: "先找中央灯塔确认方向，再沿集装箱边缘进入建筑区。",
    tips: ["码头边容易暴露，尽量贴箱体移动", "水面反光处附近通常有开阔视野"]
  },
  {
    id: "moonlit-hospital",
    image: "assets/maps/real/real-02.jpg",
    name: "地图 02",
    type: "正T型",
    difficulty: "噩梦",
    badge: "示例",
    accent: "#c65b52",
    description: "室内走廊、中庭和地下空间叠在一起，需要靠楼层与地标确认位置。",
    traits: ["室内走廊", "中庭天井", "双楼梯", "昏暗"],
    landmarks: ["急诊大厅", "地下药房", "天台出口"],
    points: [
      { label: "出生点", note: "急诊大厅和北侧病房走廊较常见" },
      { label: "密码机区", note: "地下药房附近与二楼中庭外围" },
      { label: "逃生门", note: "天台出口与西侧救护车坡道" }
    ],
    items: ["医疗箱", "手电筒", "信号枪"],
    route: "先确认急诊大厅，再沿楼梯判断楼层，最后进入地下药房区域。",
    tips: ["室内转角多，警惕短距离遭遇", "中庭位置适合快速观察整层结构"]
  },
  {
    id: "clock-tower-square",
    image: "assets/maps/real/real-03.jpg",
    name: "地图 03",
    type: "十字",
    difficulty: "噩梦",
    badge: "示例",
    accent: "#7ba7d9",
    description: "开阔广场连接多条街巷，钟楼和喷泉很容易成为定位基准。",
    traits: ["开阔广场", "钟楼地标", "街巷交错", "喷泉"],
    landmarks: ["钟楼", "中央喷泉", "市场棚架"],
    points: [
      { label: "出生点", note: "市场棚架和钟楼北侧街道常见出生" },
      { label: "密码机区", note: "沿喷泉外围和街巷交叉口分布" },
      { label: "逃生门", note: "钟楼南门与东侧巷口" }
    ],
    items: ["工具箱", "护腕", "手电筒"],
    route: "先看钟楼和喷泉连线，再沿外圈街巷确认出口。",
    tips: ["广场中央容易被观察到", "喷泉附近适合作为汇合点"]
  },
  {
    id: "foggy-factory",
    image: "assets/maps/real/real-04.jpg",
    name: "地图 04",
    type: "分叉Y型",
    difficulty: "噩梦",
    badge: "示例",
    accent: "#62b6a1",
    description: "高架管道与多层平台让路线立体化，烟雾会降低远处判断的准确度。",
    traits: ["高架管道", "传送带", "烟雾", "多层平台"],
    landmarks: ["锅炉房", "货运电梯", "冷却塔"],
    points: [
      { label: "出生点", note: "冷却塔下方与锅炉房外侧常见出生" },
      { label: "密码机区", note: "二层平台和传送带末端比较集中" },
      { label: "逃生门", note: "货运电梯出口与南侧装卸坡道" }
    ],
    items: ["工具箱", "橄榄球", "信号枪"],
    route: "先找冷却塔确定工厂朝向，再通过货运电梯切换楼层。",
    tips: ["烟雾区适合绕行但容易迷路", "高架管道能提供短距离转移"]
  },
  {
    id: "gallery-manor",
    image: "assets/maps/real/real-05.jpg",
    name: "地图 05",
    type: "右拐┐",
    difficulty: "噩梦",
    badge: "示例",
    accent: "#9f7cbe",
    description: "对称建筑和花园回廊让地图容易理解，但高墙会限制视野。",
    traits: ["花园回廊", "对称建筑", "高墙", "多出入口"],
    landmarks: ["主厅", "玻璃温室", "花园喷泉"],
    points: [
      { label: "出生点", note: "主厅两侧和温室入口常见出生" },
      { label: "密码机区", note: "回廊外侧与温室边缘比较集中" },
      { label: "逃生门", note: "主厅正门与花园西侧小门" }
    ],
    items: ["医疗箱", "地图", "信号枪"],
    route: "以主厅为中轴，先绕回廊一圈，再进入玻璃温室区域。",
    tips: ["对称建筑容易看错方向，留意门窗细节", "温室玻璃反光可以帮助确认区域"]
  },
  {
    id: "waiting-platform",
    image: "assets/maps/real/real-06.jpg",
    name: "地图 06",
    type: "竖条丨",
    difficulty: "噩梦",
    badge: "示例",
    accent: "#d88f5a",
    description: "长月台和铁轨形成清晰主线，时钟塔是最好认的标志。",
    traits: ["长月台", "铁轨", "候车室", "时钟塔"],
    landmarks: ["时钟塔", "售票厅", "地下通道"],
    points: [
      { label: "出生点", note: "候车室两侧和月台北端常见出生" },
      { label: "密码机区", note: "售票厅附近与月台中部较多" },
      { label: "逃生门", note: "地下通道两端与站台南门" }
    ],
    items: ["工具箱", "护腕", "手电筒"],
    route: "沿铁轨确定月台方向，再通过地下通道跨到对侧。",
    tips: ["月台直线视野长，尽量避免长时间直行", "时钟塔附近适合快速判断坐标"]
  },
  {
    id: "paper-lantern-lane",
    image: "assets/maps/real/real-07.jpg",
    name: "地图 07",
    type: "左拐└",
    difficulty: "噩梦",
    badge: "示例",
    accent: "#e2a34c",
    description: "窄巷、屋棚和屋顶通道叠加，红灯笼是最显眼的区域提示。",
    traits: ["窄巷", "灯笼", "屋棚", "屋顶通道"],
    landmarks: ["红灯笼门楼", "集市棚", "河道桥"],
    points: [
      { label: "出生点", note: "集市棚和河道桥附近常见出生" },
      { label: "密码机区", note: "巷口转角与屋顶通道入口较多" },
      { label: "逃生门", note: "门楼东侧与河道桥南端" }
    ],
    items: ["手电筒", "信号枪", "橄榄球"],
    route: "以红灯笼门楼为起点，沿主要巷口进入屋顶通道。",
    tips: ["屋顶通道能绕开巷内堵点", "灯笼颜色变化可以帮助区分相邻区域"]
  },
  {
    id: "ruined-theater",
    image: "assets/maps/real/real-08.jpg",
    name: "地图 08",
    type: "正T型",
    difficulty: "噩梦",
    badge: "示例",
    accent: "#c65b52",
    description: "观众席、舞台与后台组成立体迷宫，穹顶破损处能透光定位。",
    traits: ["观众席", "舞台", "后台迷宫", "穹顶"],
    landmarks: ["主舞台", "侧翼包厢", "道具仓库"],
    points: [
      { label: "出生点", note: "侧翼包厢和道具仓库门口常见出生" },
      { label: "密码机区", note: "后台走廊与舞台下层比较集中" },
      { label: "逃生门", note: "主舞台侧门与观众席出口" }
    ],
    items: ["医疗箱", "工具箱", "信号枪"],
    route: "先到主舞台确认中心，再沿包厢进入后台走廊。",
    tips: ["后台岔路多，优先记住转弯方向", "透光处往往是通往外部出口的线索"]
  },
  {
    id: "rail-yard",
    image: "assets/maps/real/real-09.jpg",
    name: "地图 09",
    type: "横杠—",
    difficulty: "噩梦",
    badge: "示例",
    accent: "#7ba7d9",
    description: "长条形仓库与铁轨平行排列，中央吊车能快速帮助定位。",
    traits: ["长仓库", "铁轨", "装卸台", "高货架"],
    landmarks: ["中央吊车", "北仓门", "调度室"],
    points: [
      { label: "出生点", note: "北仓门和调度室附近常见出生" },
      { label: "密码机区", note: "货架通道和装卸台边缘较多" },
      { label: "逃生门", note: "南侧装卸台与调度室后门" }
    ],
    items: ["工具箱", "橄榄球", "地图"],
    route: "沿铁轨方向确认南北，再围绕中央吊车切换仓库。",
    tips: ["高货架会遮挡视线，适合利用货架缝隙观察", "铁轨线是稳定的方向参考"]
  },
  {
    id: "glass-garden",
    image: "assets/maps/real/real-10.jpg",
    name: "地图 10",
    type: "左卜",
    difficulty: "噩梦",
    badge: "示例",
    accent: "#62b6a1",
    description: "玻璃温室、花圃和小池塘构成明亮区域，路径比室内地图更直接。",
    traits: ["玻璃温室", "花圃", "小径", "池塘"],
    landmarks: ["中央温室", "水塘", "工具房"],
    points: [
      { label: "出生点", note: "水塘边和工具房旁常见出生" },
      { label: "密码机区", note: "花圃小径与温室两侧分布" },
      { label: "逃生门", note: "温室北门与庭院东侧小径" }
    ],
    items: ["医疗箱", "手电筒", "护腕"],
    route: "以中央温室为圆心，沿花圃小径绕行确认出口。",
    tips: ["小径交叉点视野开阔", "温室内部和外部路线可以快速互换"]
  },
  {
    id: "underground-passage",
    image: "assets/maps/real/real-11.jpg",
    name: "地图 11",
    type: "分叉Y型",
    difficulty: "噩梦",
    badge: "示例",
    accent: "#8f9aa6",
    description: "低光、管道和岔路让方向判断更难，积水区域会成为固定参考。",
    traits: ["低光", "管道", "岔路", "积水"],
    landmarks: ["泵房", "电缆井", "安全门"],
    points: [
      { label: "出生点", note: "电缆井和安全门附近常见出生" },
      { label: "密码机区", note: "泵房外侧与管道交叉口较多" },
      { label: "逃生门", note: "安全门两侧与泵房后通道" }
    ],
    items: ["手电筒", "工具箱", "地图"],
    route: "先找泵房确定主通道，再沿积水边缘判断岔路方向。",
    tips: ["低光环境下手电筒很重要", "管道颜色可以帮助区分不同支线"]
  },
  {
    id: "old-town-corner",
    image: "assets/maps/real/real-12.jpg",
    name: "地图 12",
    type: "十字",
    difficulty: "噩梦",
    badge: "示例",
    accent: "#d8a24a",
    description: "老建筑、天桥和广告牌让街角层次丰富，十字钟楼是核心地标。",
    traits: ["老建筑", "天桥", "小巷", "广告牌"],
    landmarks: ["十字钟楼", "旧电影院", "天桥"],
    points: [
      { label: "出生点", note: "旧电影院和十字钟楼周边常见出生" },
      { label: "密码机区", note: "巷口与天桥楼梯附近较多" },
      { label: "逃生门", note: "钟楼东门与天桥南端" }
    ],
    items: ["护腕", "工具箱", "信号枪"],
    route: "以十字钟楼为中心，先确认天桥方向，再进入周边小巷。",
    tips: ["天桥可以跨过街口但不适合长时间停留", "广告牌附近常有可交互物"]
  }
  ,
  {
    id: "map-13",
    image: "assets/maps/real/real-13.jpg",
    name: "地图 13",
    type: "右拐┐",
    difficulty: "噩梦",
    badge: "素材",
    accent: "#d8a24a",
    description: "真实素材示例，等待补充正式攻略。",
    traits: ["真实截图", "待整理"],
    landmarks: ["待补充"],
    points: [
      { label: "关键点位", note: "待补充" }
    ],
    items: ["待补充"],
    route: "待补充",
    tips: ["这张图暂时使用真实素材占位"]
  },
  {
    id: "map-14",
    image: "assets/maps/real/real-14.jpg",
    name: "地图 14",
    type: "左拐└",
    difficulty: "噩梦",
    badge: "素材",
    accent: "#c65b52",
    description: "真实素材示例，等待补充正式攻略。",
    traits: ["真实截图", "待整理"],
    landmarks: ["待补充"],
    points: [
      { label: "关键点位", note: "待补充" }
    ],
    items: ["待补充"],
    route: "待补充",
    tips: ["这张图暂时使用真实素材占位"]
  },
  {
    id: "map-15",
    image: "assets/maps/real/real-15.jpg",
    name: "地图 15",
    type: "左卜",
    difficulty: "噩梦",
    badge: "素材",
    accent: "#7ba7d9",
    description: "真实素材示例，等待补充正式攻略。",
    traits: ["真实截图", "待整理"],
    landmarks: ["待补充"],
    points: [
      { label: "关键点位", note: "待补充" }
    ],
    items: ["待补充"],
    route: "待补充",
    tips: ["这张图暂时使用真实素材占位"]
  },
  {
    id: "map-16",
    image: "assets/maps/real/real-16.jpg",
    name: "地图 16",
    type: "正T型",
    difficulty: "噩梦",
    badge: "素材",
    accent: "#62b6a1",
    description: "真实素材示例，等待补充正式攻略。",
    traits: ["真实截图", "待整理"],
    landmarks: ["待补充"],
    points: [
      { label: "关键点位", note: "待补充" }
    ],
    items: ["待补充"],
    route: "待补充",
    tips: ["这张图暂时使用真实素材占位"]
  },
  {
    id: "map-17",
    image: "assets/maps/real/real-17.jpg",
    name: "地图 17",
    type: "十字",
    difficulty: "噩梦",
    badge: "素材",
    accent: "#8f9aa6",
    description: "真实素材示例，等待补充正式攻略。",
    traits: ["真实截图", "待整理"],
    landmarks: ["待补充"],
    points: [
      { label: "关键点位", note: "待补充" }
    ],
    items: ["待补充"],
    route: "待补充",
    tips: ["这张图暂时使用真实素材占位"]
  }
];
