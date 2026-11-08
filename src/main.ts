/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-open
 * https://github.com/wsrh8888/beaver-open
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-open-header-v1
 */

import { createPinia } from "pinia"
import { createApp } from "vue"
import App from "./App.vue"

import router from "./router"
// 顺序不可调换：先加载 EP 编译后的 CSS，再用 --el-* 变量覆盖它，最后加载全局样式
import "element-plus/dist/index.css"
import "./styles/design-system.css"
import "./styles/element-overrides.css"
import "./styles/global.css"

const app = createApp(App)
const pinia = createPinia()

// 图标不做全量注册：模板中唯一使用的 User 是组件内 import 后作为 el-avatar 的 :icon 传入
app.use(pinia)
app.use(router)

app.mount("#app")
