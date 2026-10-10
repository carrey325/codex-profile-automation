# Local weekly updates / 本地每周更新

Create a **local scheduled task in Codex** after you have generated and published your first banner successfully. The tool and profile repository should already be cloned locally, dependencies installed, and Codex and Git signed in.

The example below uses Saturday at 22:00 in a timezone you choose. It intentionally skips a missed run. The time check is a task instruction, not a native guarantee that the scheduler never wakes late. The local computer and Codex app must be available to do the work.

Replace all placeholders before using this prompt:

> Create a local Codex task for every Saturday at 22:00 in TIMEZONE. First check the actual current time in TIMEZONE. Only begin the update during Saturday's 22:00 minute. If the task wakes later because the computer was off, asleep, the app was closed or the task was queued, skip this occurrence and wait until next week; do not catch up or create retries. A run that starts within that minute may finish normally. Use TOOL_REPO_PATH for Codex Activity Banner and PROFILE_REPO_PATH for my GitHub profile clone. Verify that the profile remote belongs to my intended account and that the working tree is clean; stop without overwriting anything if it has unrelated changes. Pull the profile branch with fast-forward only. From TOOL_REPO_PATH, run `npm run update -- --timezone "TIMEZONE" --output "PROFILE_REPO_PATH/assets/codex-activity.svg"`. Validate the generated SVG and capture date, then commit only that image with message `Refresh weekly Codex usage` and push the profile branch. Do not commit unchanged output. If login, generation or publishing fails, keep the previous published image and report the error; do not retry later in the week. Keep all authentication local and never upload credentials. Notify me only if a run needs my attention.

Use an IANA timezone, such as `Asia/Shanghai`, `Europe/London` or `America/New_York`. The schedule and renderer should use the same timezone. Review the task's saved schedule after creation. The generator itself never schedules tasks, commits files or pushes to GitHub.

---

首次手动生成和发布成功后，再创建本地 Codex 定时任务。先准备好工具仓库、个人主页仓库、依赖和登录状态。

复制以下文字给 Codex，并替换全部占位符：

> 创建一个本地 Codex 定时任务，每周六 TIMEZONE 时区晚上 22:00 更新个人主页。任务开始时先检查该时区的真实当前时间，仅允许在周六 22:00 这一分钟内开始更新。若因关机、休眠、应用关闭或排队而延迟唤醒，跳过这一次，等下周，不补跑、不创建重试任务；在规定时间内开始的任务可以正常执行完成。工具仓库位于 TOOL_REPO_PATH，个人主页仓库位于 PROFILE_REPO_PATH。确认主页仓库远端与分支正确，工作区干净；有其他改动时不要覆盖或代为提交。只允许快进拉取。在工具仓库运行 `npm run update -- --timezone "TIMEZONE" --output "PROFILE_REPO_PATH/assets/codex-activity.svg"`。核验 SVG 和采集日期后，仅提交这张图片，提交信息为 `Refresh weekly Codex usage`，并推送个人主页分支；图片无变化则不提交。登录、生成或推送失败时保留已发布图片并报告，不在本周其他时间重试。凭据留在本机，不上传登录文件。仅在需要我处理问题时通知我。

TIMEZONE 使用 `Asia/Shanghai` 等 IANA 时区名。创建后检查保存的星期、时间及时区。这里的“错过就跳过”由任务内的时间检查落实，不能理解成系统绝不会延迟唤醒；实际更新仍需要电脑和 Codex 可用。
