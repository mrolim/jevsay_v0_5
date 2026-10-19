import type { CanonicalActionId } from './schemas';

export interface CatalogItem {
  action_id: CanonicalActionId;
  text: string;
  language: "th" | "en";
  look_at: { x: number; y: number; distance_norm: number };
  priority: number;
  interrupt_policy: "queue" | "blend" | "hard_cut";
  keywords: string[];
}

export const RESPONSE_CATALOG: Record<CanonicalActionId, CatalogItem> = {
  ACTION_GREETING_WAI: {
    action_id: "ACTION_GREETING_WAI",
    text: "สวัสดีครับ ยินดีต้อนรับสู่ศูนย์บริการอัจฉริยะ มีอะไรให้ผมช่วยเหลือไหมครับ",
    language: "th",
    look_at: { x: 0.0, y: 0.05, distance_norm: 0.5 },
    priority: 1,
    interrupt_policy: "blend",
    keywords: ["สวัสดี", "หวัดดี", "ฮัลโหล", "hello", "hi", "ทักทาย", "ยินดีต้อนรับ"]
  },
  ACTION_POINT_EAST_WING: {
    action_id: "ACTION_POINT_EAST_WING",
    text: "ห้องน้ำอยู่ทางด้านปีกตะวันออกครับ เดินตรงไปทางขวามือประมาณ 30 เมตรได้เลยครับ",
    language: "th",
    look_at: { x: 0.65, y: 0.0, distance_norm: 0.6 },
    priority: 1,
    interrupt_policy: "blend",
    keywords: ["ห้องน้ำ", "ส้วม", "สุขา", "ฉี่", "เข้าห้องน้ำ", "restroom", "toilet"]
  },
  ACTION_POINT_WEST_WING: {
    action_id: "ACTION_POINT_WEST_WING",
    text: "ลิฟต์โดยสารอยู่ทางด้านปีกตะวันตกครับ เดินเลี้ยวซ้ายข้างเคาน์เตอร์ประชาสัมพันธ์ได้เลยครับ",
    language: "th",
    look_at: { x: -0.65, y: 0.1, distance_norm: 0.6 },
    priority: 1,
    interrupt_policy: "blend",
    keywords: ["ลิฟต์", "ลิฟท์", "ขึ้นชั้น", "บันไดเลื่อน", "elevator", "lift"]
  },
  ACTION_SHOW_PROMO_CARD: {
    action_id: "ACTION_SHOW_PROMO_CARD",
    text: "วันนี้มีโปรโมชั่นพิเศษ ช้อปครบ 1,000 บาท รับคูปองส่วนลดทันที 200 บาทที่จุดบริการครับ",
    language: "th",
    look_at: { x: 0.0, y: -0.15, distance_norm: 0.4 },
    priority: 1,
    interrupt_policy: "blend",
    keywords: ["โปรโมชั่น", "ส่วนลด", "ลดราคา", "แคมเปญ", "คูปอง", "promotion", "discount"]
  },
  ACTION_INFO_RETAIL: {
    action_id: "ACTION_INFO_RETAIL",
    text: "โซนร้านกาแฟและร้านอาหารเปิดให้บริการทุกวัน ตั้งแต่เวลา 10 โมงเช้า ถึง 4 ทุ่มตรงครับ",
    language: "th",
    look_at: { x: 0.1, y: 0.0, distance_norm: 0.5 },
    priority: 1,
    interrupt_policy: "blend",
    keywords: ["กาแฟ", "ร้านอาหาร", "เปิดกี่โมง", "ปิดกี่โมง", "สตาร์บัค", "ศูนย์อาหาร", "เวลาเปิด"]
  },
  ACTION_CALL_STAFF: {
    action_id: "ACTION_CALL_STAFF",
    text: "ต้องขออภัยในความไม่สะดวกเป็นอย่างสูงครับ ผมกำลังติดต่อเจ้าหน้าที่ฝ่ายดูแลลูกค้าให้เข้ามาดูแลท่านทันทีครับ",
    language: "th",
    look_at: { x: 0.0, y: -0.1, distance_norm: 0.4 },
    priority: 2,
    interrupt_policy: "hard_cut",
    keywords: ["รอนาน", "ช้ามาก", "ห่วย", "แย่มาก", "ผู้จัดการ", "ร้องเรียน", "ไม่พอใจ", "โมโห", "ช่วยด้วย"]
  },
  ACTION_POLITE_REFUSAL: {
    action_id: "ACTION_POLITE_REFUSAL",
    text: "ขออภัยครับ ระบบขอความร่วมมือใช้ถ้อยคำที่สุภาพในการสนทนา หากต้องการความช่วยเหลือสามารถแจ้งได้เลยครับ",
    language: "th",
    look_at: { x: 0.0, y: 0.0, distance_norm: 0.5 },
    priority: 3,
    interrupt_policy: "hard_cut",
    keywords: []
  },
  ACTION_POINT_EXIT: {
    action_id: "ACTION_POINT_EXIT",
    text: "The emergency exit and main entrance are located straight ahead through the glass double doors.",
    language: "en",
    look_at: { x: 0.4, y: 0.05, distance_norm: 0.7 },
    priority: 1,
    interrupt_policy: "blend",
    keywords: ["exit", "emergency", "way out", "entrance", "where is", "ทางออก", "ทางหนีไฟ"]
  },
  ACTION_OUT_OF_SCOPE: {
    action_id: "ACTION_OUT_OF_SCOPE",
    text: "ขออภัยครับ ข้อมูลส่วนนี้อยู่นอกเหนือการให้บริการของตู้คีออส ท่านสามารถเลือกหัวข้อที่ต้องการสอบถามได้จากหน้าจอด้านล่างนี้ครับ",
    language: "th",
    look_at: { x: -0.15, y: 0.15, distance_norm: 0.5 },
    priority: 1,
    interrupt_policy: "blend",
    keywords: ["หวย", "การเมือง", "นายก", "รหัสผ่าน", "ignore previous", "system prompt", "สมมติว่า"]
  },
  ACTION_BOW_THANKYOU: {
    action_id: "ACTION_BOW_THANKYOU",
    text: "ขอบคุณที่ใช้บริการครับ ขอให้มีความสุขกับการใช้บริการในวันนี้ สวัสดีครับ",
    language: "th",
    look_at: { x: 0.0, y: -0.05, distance_norm: 0.5 },
    priority: 1,
    interrupt_policy: "blend",
    keywords: ["ขอบคุณ", "แต้งกิ้ว", "บ๊ายบาย", "ลาก่อน", "thank you", "thanks", "bye"]
  }
};
