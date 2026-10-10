# Codex Activity Banner

把 Codex 用量变成适合 GitHub 个人主页的浅色长条：上面是最近一整年的热力图，下面是五项统计。

[English](README.md) · [本地定时更新](docs/scheduling.md) · [隐私说明](SECURITY.md)

<img src="docs/preview.svg" width="100%" alt="虚构数据预览：蓝色全年热力图与五项用量统计" />

**上图全部使用程序生成的虚构数据，不包含任何人的真实账号或用量。**

## 功能

- 最近完整一年，自动处理 365 / 366 天与闰年。
- 累计 Token、单日峰值、最长任务用时、最长连续天数、当前连续天数。
- 1200 × 366 SVG，使用 `width="100%"` 铺满 README 宽度。
- 可配置标题与显示时区；默认标题为 `Building with AI: Codex activity`。
- 在本机通过已经登录的 Codex CLI 读取聚合用量，不需要搭建服务或把登录凭据上传到 GitHub。

这是基于 [Codex Usage Profile](https://github.com/postmelee/codex-usage-profile) 的独立改造，保留了原项目的日历布局和热度分级算法，并增加宽幅展示和本地使用方式。来源与许可见下方。

## 先试效果

需要 Node.js 20+ 和 Git。运行演示不需要登录 Codex。

```sh
git clone https://github.com/carrey325/codex-profile-automation.git codex-activity-banner
cd codex-activity-banner
npm ci --ignore-scripts --no-audit --no-fund
npm run demo
```

打开 `docs/preview.svg` 即可查看虚构数据示例。

## 生成自己的图

安装较新的 [Codex CLI](https://learn.chatgpt.com/docs/cli)，执行 `codex login`，使用 ChatGPT 账号登录。CLI 需要在 PATH 中且支持 `account/usage/read`；本项目开发时使用 CLI 0.149.1，用量采集依赖固定为 `codex-usage-analyzer@0.4.1`。仅使用 API Key 的登录不能提供这里所需的 ChatGPT 账号用量。

```sh
npm run update
```

结果位于 `output/codex-activity.svg`，该目录默认不纳入 Git，避免把你的真实用量误提交到工具仓库。

也可以直接生成到你的个人主页仓库的本地克隆中：

```sh
npm run update -- --timezone "Asia/Shanghai" --output "../YOUR_USERNAME/assets/codex-activity.svg"
```

将 `../YOUR_USERNAME` 换成你本地 `YOUR_USERNAME/YOUR_USERNAME` 仓库的路径。带空格的路径需要引号。脚本只生成文件，不会自动提交或推送。

在个人主页仓库的 README 中加入：

```html
<img src="assets/codex-activity.svg" width="100%" alt="My Codex activity over the last year" />
```

然后在**个人主页仓库**内提交：

```sh
git add README.md assets/codex-activity.svg
git commit -m "Add Codex activity banner"
git push
```

以后重新生成图片并提交 SVG 即可更新。GitHub 图片缓存可能需要一点时间才能刷新。

## 自动更新

可以设置一个本地 Codex 定时任务，例如每周六晚上 22:00 生成并推送；如果当时电脑或 Codex 没有运行，就跳过这一周，不补跑。可直接使用[本地任务模板](docs/scheduling.md)。

仓库附带的 GitHub Actions **只做测试和虚构数据演示**，不会读取你的真实用量，也不需要账号 Secrets。本地定时任务仍需要电脑与 Codex 在运行时可用。

## 选项与数据口径

```sh
npm run update -- --help
npm run update -- --title "Building with AI: Codex activity" --timezone "Asia/Shanghai"
npm run update -- --input "/path/to/aggregate-usage.json" --output "output/banner.svg"
```

- `--output`：输出位置，默认 `output/codex-activity.svg`。
- `--timezone`：决定图上截止日期的时区，默认 UTC，不会重新划分来源数据的每日归属。
- `--title`：自定义标题，最多 40 个字符。
- `--demo`：使用虚构数据，无需登录。
- `--input`：读取已有聚合 JSON，无需访问 Codex；结构参考 [`demoUsage()`](src/demo.mjs)。

热力图显示最近一年；下方的累计与峰值等统计使用账号返回的原始口径，并不全部局限于图中这一年。缺失统计显示 `—`，每日数据不可用时会注明。上游没有提供的历史不能由本工具补齐。生成失败时保留上一次成功的图片。

发布 SVG 会公开其中的用量和活跃日期；不要提交任何 `auth.json`、Token 或登录文件。完整说明见 [SECURITY.md](SECURITY.md)。

## 开发、来源与许可

```sh
npm test
npm run demo
```

日历布局和热度分级改编自 **postmelee/codex-usage-profile** 的 `src/profile-card/heatmap.js`，参考提交为 `6d3e600d2d33bb7a50147075d013ddd9b945d0b1`。本项目新增宽幅布局、统计栏、可配置本地生成器、虚构数据预览与使用文档；用量采集依赖 `codex-usage-analyzer`。

采用 [MIT 许可](LICENSE)，原作者的版权和许可完整保留在 [LICENSE.upstream](LICENSE.upstream)。这是社区项目，并非 OpenAI 官方产品。
