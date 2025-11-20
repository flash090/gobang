# 开发日志：Gobang 联机五子棋项目


## 2025-06-15
-语言：项目选型（Next.js + Supabase + Vercel）决定了必须用 JS/TS，需要将原Python代码“翻译”为JS/TS版本
-重新明确开发步骤，下一步：初始化项目，用 Vercel Starter 创建 Next.js + Supabase 项目骨架，配置好本地开发环境，能跑起来 Hello World


## 2025-05-06
-部署到Vercel前期准备报错，已解决
-已部署到Vercel，获得了公共链接，但邀请玩家的链接打不开，开VPN也不行
-搜索了国内环境问题，可能需要租一个阿里云/腾讯云域名再+cloudfare+把vercel域名定向到新域名

代办：
-还在开发完善中：可以先用临时隧道测试，之后再部署到Vercel
-ngrok临时隧道，用于快速测试，需要注册，后来放弃
npx ngrok http 3002
Need to install the following packages:
ngrok@5.0.0-beta.2
Ok to proceed? (y) y
ERROR:  authentication failed: Usage of ngrok requires a verified account and authtoken.
ERROR:  
ERROR:  Sign up for an account: https://dashboard.ngrok.com/signup
ERROR:  Install your authtoken: https://dashboard.ngrok.com/get-started/your-authtoken
npm install -g vercel
vercel
-ui原型绘制，集合所有后期可能出现的功能
-ai功能构思、接入ai对战和ai游戏中对话功能
-python代码如何翻译？游戏逻辑在旧代码基础上继续
-联机细节，如邀请制or大厅制，是否要有多个房间，玩家的编号，颜色是否控制等


推荐的下一步
-创建UI原型：设计包含基本游戏和LLM交互的界面
-实现基本游戏逻辑：从Python代码迁移关键功能到gameLogic.ts
-添加简单的AI聊天界面：在游戏边缘添加聊天框组件
-连接AI API：实现上述API端点，连接到OpenAI或类似服务
-迭代改进：根据测试反馈优化用户体验







## 2025-05-05
- 完成了技术选型：放弃纯前端 p5.js，转向 Next.js + Supabase + Vercel + Serverless API（有图片教程）。
- 理解了 Supabase 的 Realtime 功能可以代替自己搭建 WebSocket 服务。
- 学习了 Vercel 的部署流程，准备用 Starter 模板搭建项目。

- 搭建了项目文件夹框架目录，学会了在cursor根目录运行终端，在终端安装了依赖Node.js、Supabase JS 客户端 SDK等
- 注册supabase并将rul和ANON_KEY写入文件，key是否需要加密保护？不知道是否生效？
- 能在http://localhost:3000运行，开发环境运行正常
- 在page.tsx写入了简易棋盘 UI,可以看到棋盘
- gpt4o表现一般，4ominihigh会更好吗？又转到cursor内置3.7sonnet修复问题
-cursor接管后，修复了棋盘UI中A-O列和网格的对齐问题
Supabase集成
安装了Supabase客户端库 @supabase/supabase-js
创建了Supabase客户端连接工具 (app/utils/supabase.ts)
解决了环境变量加载问题，确保Supabase连接配置正确
数据库设计
设计了rooms表结构存储游戏房间和棋盘状态
创建了用于设置Supabase数据库的SQL脚本
配置了行级安全策略和实时更新功能
API实现
创建了create-room API端点用于创建新游戏房间
创建了make-move API端点用于处理玩家落子
创建了join-room API端点用于加入现有游戏
客户端重构
重新设计了主页面，直接与Supabase交互，不再通过API
添加了房间创建、加入和数据库检查功能
实现了错误处理和用户友好的错误提示
多人实时功能
使用Supabase Realtime实现了实时游戏状态同步
添加了用户角色管理（先加入的是X/黑棋，后加入的是O/白棋）
添加了当前回合指示和等待对手提示
URL参数和邀请功能
实现了通过URL参数加入特定房间的功能
添加了"复制邀请链接"按钮，方便分享游戏
确保URL中包含房间ID，便于分享和加入
用户界面优化
改进了游戏状态显示（当前玩家、回合等）
添加了房间创建和加入的用户界面
优化了移动设备上的显示效果
联机测试
在本地网络中成功测试了多人实时对战功能
实现了不同浏览器间的实时同步
讨论了不同网络环境下的部署和分享选项
部署选项讨论
提供了三种不同的部署和分享方式：
本地网络分享（适用于同一网络下的朋友）
Vercel部署（适用于互联网上的长期分享）
临时隧道服务（用于短期测试和分享）


## 待办事项
- [ ] 使用 Vercel Starter 初始化 Next.js + Supabase 项目
- [ ] 在 Supabase 控制台中创建表结构（rooms, results）
- [ ] 编写房间创建与加入 API
- [ ] 设计前端棋盘布局（先用 placeholder 组件）

## 技术研究中
- Supabase 的权限策略（RLS）
- 多人数据同步效率 vs 单独 socket 管理


## 2025-04-04
五子棋后续开发规划

1. UI界面改进

交叉点落子设计
- **棋盘结构**: 将现有的方格式改为线条交叉点，需要调整单元格渲染方式
- **落子逻辑**: 修改`click_event`检测逻辑，判断点击位置与交叉点的距离
- **棋子渲染**: 使用圆形而非文字符号，可用`canvas.create_oval`绘制

索引标注
- 在棋盘周围添加行(1-15)和列(A-O)标签
- 使用`canvas.create_text`在适当位置绘制

棋子样式优化
- 对不同玩家使用不同颜色而非符号
- 添加落子动画和声音效果
- 考虑胜利路径高亮显示

跨平台适配
- **架构分离**: 将游戏逻辑与UI完全分离
- **渲染适配层**: 创建抽象接口，允许不同平台实现各自渲染方法
- **技术选择**: 
  - Web: 考虑Flask+WebSocket+Canvas/SVG
  - 小程序: 使用微信小程序Canvas API
  - 移动端: 考虑React Native或Flutter

2. AI智能提升

短期改进
- 实现MinMax算法基础版，深度2-3层
- 添加Alpha-Beta剪枝优化搜索效率
- 基本评估函数：计算连子潜力、威胁和机会

中期改进
- 启发式搜索，优先考虑有潜力的位置
- 动态搜索深度，关键位置深入分析
- 模式识别：预编译常见棋型(活三、冲四等)

高级AI（长期）
- 基于神经网络的评估函数
- 参考AlphaGo Zero的自我对弈训练方法
- 离线训练，导出轻量级模型供游戏使用

3. 简易在线联机方案

Firebase无服务器方案 or 
- **WebRTC P2P连接**: 仅需简单信令服务
- **Firebase实时数据库**: 免费额度足够小规模使用
- **LAN直连**: 局域网内玩家可直接连接

Heroku/Vercel+WebSocket或Socket.IO低成本服务器方案

同步机制
- 仅发送移动指令(行、列、玩家)，减少带宽
- 使用简单时间戳解决冲突
- 游戏状态定期同步确保一致性

4. 炸弹道具系统

基础设计
- 在玩家回合可选择使用道具而非下棋
- 炸弹影响区域可视化(目标位置周围高亮)
- 爆炸动画和音效增强体验

平衡性考虑
- 限制每位玩家道具使用次数
- 炸弹可能对自己的棋子也有影响
- 考虑添加道具获取机制(如连续有效防守后奖励)

拓展性
- 预留更多道具接口
- 考虑多种道具：盾牌(防炸弹)、重布局(移动己方棋子)等

这份规划涵盖了各方面的后续发展方向，既考虑了技术可行性，也兼顾了游戏体验提升。您可以根据兴趣和资源优先选择实现其中的部分功能。

5. 落子交互系统
范围限制可以用一个浅色半透明方块来引导范围，落子前选择位置时可以有一个浅色的棋子投影提示位置（而不是鼠标）

6.棋子自定义系统

玩家可以在游戏开始前的等待时间里简易绘制自己的棋子样式
AI玩家也有相应的棋子样式生成


后续时间计划：
第二阶段	4. tkinter UI（绘制棋盘 + 鼠标点击下棋）	高
	5. Flask + WebSocket 联网（支持朋友在线对战）	高
第三阶段	6. 进阶 AI（强化 Hard 模式）	低
	7. pygame UI（如果需要更流畅动画）	低
