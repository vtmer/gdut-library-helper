.PHONY: clean main combile_js build_js convert_crx build_crx

SCRIPT_NAME=gdut-library-helper
JS_NAME=$(SCRIPT_NAME).js
GM_SCRIPT_NAME=$(SCRIPT_NAME).gm.js
CRX_NAME=$(SCRIPT_NAME).crx
CRX_PEM=$(SCRIPT_NAME).pem

BUILD_DIR=`pwd`/dist
JS_BUILD_SCRIPT=`pwd`/dist/$(JS_NAME)
CRX_BUILD_DIR=$(BUILD_DIR)/crx

GM_CONVERTER=python3 `pwd`/gm2chrome/converter.py
CHROME=/usr/bin/chromium
GRUNT=grunt


main: build_crx build_js


# 打包脚本成 crx 格式
build_crx: $(CRX_NAME) convert_crx
	if [ -a $(CRX_PEM) ]; \
	then \
		$(CHROME) --pack-extension=$(CRX_BUILD_DIR) --pack-extension-key=$(CRX_PEM); \
	else \
		$(CHROME) --pack-extension=$(CRX_BUILD_DIR); \
		mv -f ${CRX_BUILD_DIR}.pem $(CRX_PEM); \
	fi;
	mv -f ${CRX_BUILD_DIR}.crx $(CRX_NAME)


# 调用 ``gm2chrome`` 脚本将油猴脚本转换成标准的 chrome 插件脚本
convert_crx: compile_js
	$(GM_CONVERTER) $(JS_BUILD_SCRIPT) $(CRX_BUILD_DIR)


# 打包脚本为油猴脚本
build_js: compile_js
	cp $(JS_BUILD_SCRIPT) $(GM_SCRIPT_NAME)


# 使用 ``browserify`` 编译脚本
compile_js: $(BUILD_JS)
	$(GRUNT)
