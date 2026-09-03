# ImmortalWrt DDNS packages

本仓库提供 ImmortalWrt 24.10.x 可用的 DDNS 软件包：

- `ddns-web`：DDNS 核心程序、procd 服务脚本和默认配置。
- `luci-app-ddns-web`：LuCI“服务”页面，只负责启停、状态和打开 DDNS Web 控制台。

Provider、Record、Webhook、日志及 Web 账号请在 DDNS 自带 Web 页面配置。默认地址为 `http://路由器地址:8686/`。

## 放入 ImmortalWrt

将本仓库放入 ImmortalWrt 源码树的 `package/` 下，或作为自定义 feed 引入：

```sh
git clone https://github.com/lgyong511/luci-app-ddns.git package/luci-app-ddns
./scripts/feeds update -a
./scripts/feeds install -a
make menuconfig
```

在 `LuCI -> Applications` 中选择 `luci-app-ddns-web`，同时选择其依赖的 `ddns-web`，然后编译固件或单独编译软件包：

```sh
make package/ddns-web/compile V=s
make package/luci-app-ddns-web/compile V=s
```

首次安装后，在 LuCI 的“服务 -> DDNS”中启用服务并启动。DDNS 首次打开 Web 控制台时会引导创建账号。

## 发布与升级

推送与 `ddns-web/Makefile` 中版本匹配的 tag 会自动创建 GitHub Release。tag 格式固定为 `v<PKG_VERSION>-<PKG_RELEASE>`；当前版本示例为 `v1.6.11-1`。

若 tag 推送时未触发工作流，可在 GitHub 的 `Actions -> Release -> Run workflow` 中输入已存在的完整 tag（例如 `v1.6.11-1`）后手动构建。手动触发会检出该 tag，并执行与自动发布完全相同的版本校验和发布流程；无需修改 `PKG_RELEASE`。

每个 Release 包含可放入 ImmortalWrt 源码树自行编译的源码归档、SHA256 校验文件，以及使用 ImmortalWrt 24.10.2 SDK 为 x86_64 和 ARM64（`armsr/armv8`）编译的 IPK。

安装预编译版本时，下载匹配设备目标的 `ddns-web` 和 `luci-app-ddns-web` 两个 IPK，上传到路由器后执行：

```sh
opkg install /tmp/*ddns*.ipk
```

上游 DDNS 发布新 tag 后，更新 `ddns-web/Makefile` 中的 `PKG_VERSION`、对应 tag 的提交 SHA（`PKG_SOURCE_VERSION`）与兼容补丁；验证 SDK 编译后将 `PKG_RELEASE` 设为 `1`。仅修改本仓库的 LuCI、服务脚本或打包文件时，保持上游版本和提交不变，仅递增 `PKG_RELEASE`。
