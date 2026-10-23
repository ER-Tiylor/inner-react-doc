# OCR 识别

> 当前为 **占位能力**：API 名称和证件类型已经确定，但尚未接入实际 OCR。调用时只校验 `type` 并立即返回 `{}`，不会打开相机，也不会发起识别请求。

| API | 功能行为 | 当前返回值 | 状态 |
| --- | --- | --- | --- |
| `native.ocr.recognizeDocument()` | 按证件类型采集并识别结构化信息 | `{}` | 占位 |

## `native.ocr.recognizeDocument()`

**功能行为：** 该 API 预期用于采集指定类型的证件图片、执行 OCR，并返回可供表单使用的结构化识别结果。OCR 只负责采集和识别；注册、认证、字段确认和表单提交仍由业务页面负责。

当前实现尚未执行上述行为，只保留稳定的调用入口和类型校验。业务功能在状态变为“已实现”前，不应依赖返回值完成真实识别流程。

```ts
recognizeDocument(options: {
  type: OcrType;
}): Promise<object>
```

```js
// native 和 OCR_TYPE 从公共 JS-Bridge 入口导入。
const result = await native.ocr.recognizeDocument({
  type: OCR_TYPE.ID_CARD_FRONT,
});
console.log(result); // 当前为 {}
```

## 证件类型

| 常量 | 值 | 类型 |
| --- | --- | --- |
| `ID_CARD_FRONT` / `ID_CARD_BACK` | `10` / `11` | 身份证正反面 |
| `VEHICLE_LICENSE_FRONT` / `VEHICLE_LICENSE_BACK` | `20` / `21` | 行驶证正反面 |
| `DRIVING_LICENSE_FRONT` / `DRIVING_LICENSE_BACK` | `50` / `51` | 驾驶证正反面 |
| `BUSINESS_LICENSE` | `3` | 营业执照 |
| `ROAD_TRANSPORT_CERTIFICATE` | `4` | 道路运输证 |
| `ROAD_TRANSPORT_LICENSE` | `6` | 道路运输经营许可证 |
| `BANK_CARD` | `7` | 银行卡 |
| `PROFESSIONAL_QUALIFICATION_CERTIFICATE` | `8` | 从业资格证 |

不支持的类型会在 H5 封装层直接抛出 `INVALID_ARGUMENT`。
