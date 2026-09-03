include $(TOPDIR)/rules.mk

PKG_NAME:=ddns-web
PKG_VERSION:=1.6.11
PKG_RELEASE:=1

PKG_SOURCE_PROTO:=git
PKG_SOURCE_URL:=https://github.com/lgyong511/ddns.git
PKG_SOURCE_VERSION:=6dca50aa700ff222515224a70c0ece0c84e16482
PKG_SOURCE_SUBDIR:=$(PKG_NAME)-$(PKG_VERSION)
PKG_SOURCE:=$(PKG_SOURCE_SUBDIR).tar.gz

PKG_MAINTAINER:=lgyong511
PKG_BUILD_DEPENDS:=golang/host
PKG_BUILD_PARALLEL:=1

GO_PKG:=ddns
GO_PKG_BUILD_PKG:=ddns/cmd/ddns
GO_PKG_LDFLAGS:=-s -w
GO_PKG_LDFLAGS_X:=ddns/pkg/version.Version=v$(PKG_VERSION)

include $(INCLUDE_DIR)/package.mk
include $(TOPDIR)/feeds/packages/lang/golang/golang-package.mk

define Package/ddns-web
  SECTION:=net
  CATEGORY:=Network
  SUBMENU:=IP Addresses and Names
  TITLE:=DDNS Web service
  URL:=https://github.com/lgyong511/ddns
  DEPENDS:=$(GO_ARCH_DEPENDS) +ca-bundle
endef

define Package/ddns-web/description
 A lightweight dynamic DNS client with its own Web configuration console.
endef

define Package/ddns-web/conffiles
/etc/config/ddns-web
/etc/ddns/config.yaml
endef

define Package/ddns-web/install
	$(call GoPackage/Package/Install/Bin,$(1))
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) ./files/ddns-web.config $(1)/etc/config/ddns-web
	$(INSTALL_DIR) $(1)/etc/ddns
	$(INSTALL_CONF) ./files/config.yaml $(1)/etc/ddns/config.yaml
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/ddns-web.init $(1)/etc/init.d/ddns-web
endef

define Package/ddns-web/postinst
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || /etc/init.d/ddns-web enable
exit 0
endef

$(eval $(call GoBinPackage,ddns-web))
$(eval $(call BuildPackage,ddns-web))
