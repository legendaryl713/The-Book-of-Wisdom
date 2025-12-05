import { InspirationResponse } from "../types";

// Local database of quotes for offline inspiration
const LOCAL_QUOTES: Record<string, InspirationResponse[]> = {
  "积极": [
    { text: "生活不是等待风暴过去，而是学会在雨中跳舞。", author: "维维安·格林" },
    { text: "面向阳光，阴影就在你身后。", author: "惠特曼" },
    { text: "每一个不曾起舞的日子，都是对生命的辜负。", author: "尼采" },
    { text: "星光不问赶路人，时光不负有心人。", author: "佚名" },
    { text: "你当像鸟飞往你的山。", author: "塔拉·韦斯特弗" },
    { text: "只要这一天还在，一切皆有可能。", author: "佚名" }
  ],
  "忧郁": [
    { text: "忧郁是心灵的冬夜，虽寒冷，却能让你看见最亮的星。", author: "维克多·雨果" },
    { text: "我们都在阴沟里，但仍有人仰望星空。", author: "奥斯卡·王尔德" },
    { text: "人的一切痛苦，本质上都是对自己无能的愤怒。", author: "王小波" },
    { text: "生命是一袭华美的袍，爬满了虱子。", author: "张爱玲" },
    { text: "悲伤会飞走，像时间的翅膀一样。", author: "拉·封丹" }
  ],
  "好奇": [
    { text: "治愈无聊的良药是好奇心。好奇心无药可救。", author: "多萝西·帕克" },
    { text: "真正的发现之旅不在于寻找新大陆，而在于拥有新的目光。", author: "马塞尔·普鲁斯特" },
    { text: "世界充满了神奇的事物，耐心地等待着我们的感官变得敏锐。", author: "威廉·巴特勒·叶芝" },
    { text: "我们要探索，而探索的终点将是回到开始之处，并生平第一次认识那个地方。", author: "T.S. 艾略特" },
    { text: "保持好奇，往往是发现美好的第一步。", author: "佚名" }
  ],
  "充满希望": [
    { text: "希望是长有羽毛的东西，它栖息在灵魂里。", author: "艾米莉·狄金森" },
    { text: "冬天来了，春天还会远吗？", author: "雪莱" },
    { text: "黑夜无论怎样悠长，白昼总会到来。", author: "莎士比亚" },
    { text: "世上只有一种英雄主义，就是在认清生活真相之后依然热爱生活。", author: "罗曼·罗兰" },
    { text: "纵有疾风起，人生不言弃。", author: "瓦雷里" }
  ],
  "斯多葛": [
    { text: "人不是被事物本身困扰，而是被他们对事物的看法困扰。", author: "爱比克泰德" },
    { text: "不要要求事情按你的意愿发生，而要希望它们按实际发生的那样发生。", author: "爱比克泰德" },
    { text: "除了我们自己的思想，没有什么完全在我们的掌控之中。", author: "笛卡尔" },
    { text: "接受发生的一切，就像那是你选择的一样。", author: "马可·奥勒留" },
    { text: "理性统治内心，方得自由。", author: "塞内卡" }
  ],
  "浪漫": [
    { text: "爱是灵魂的诗。", author: "诺瓦利斯" },
    { text: "若你是一朵花，我愿是那只蝴蝶。", author: "维克多·雨果" },
    { text: "我爱你，不光因为你的样子，还因为和你在一起时，我的样子。", author: "罗伊·克罗夫特" },
    { text: "晓看天色暮看云，行也思君，坐也思君。", author: "唐寅" },
    { text: "海底月是天上月，眼前人是心上人。", author: "张爱玲" }
  ],
  "混乱": [
    { text: "混乱并非深渊，混乱是阶梯。", author: "乔治·R·R·马丁" },
    { text: "必须心中有混沌，才能诞生跳舞的星星。", author: "尼采" },
    { text: "在乱世中，不仅要生存，更要绽放。", author: "佚名" },
    { text: "秩序是凡人的需要，天才掌控混乱。", author: "爱因斯坦" },
    { text: "即使在最深的混乱中，也有潜在的和谐。", author: "荣格" }
  ],
  "宁静": [
    { text: "内心的宁静是通往幸福的钥匙。", author: "达赖喇嘛" },
    { text: "采菊东篱下，悠然见南山。", author: "陶渊明" },
    { text: "非淡泊无以明志，非宁静无以致远。", author: "诸葛亮" },
    { text: "静水流深。", author: "谚语" },
    { text: "心若不动，风又奈何。", author: "佚名" }
  ]
};

// Fallback if mood is somehow not found
const FALLBACK_QUOTE: InspirationResponse = {
  text: "认识你自己。",
  author: "苏格拉底"
};

export const getInspiration = async (mood: string): Promise<InspirationResponse | null> => {
  // Simulate a brief "thinking" delay for better UX (so it doesn't feel like a glitch)
  await new Promise(resolve => setTimeout(resolve, 600));

  const moodQuotes = LOCAL_QUOTES[mood];
  
  if (!moodQuotes || moodQuotes.length === 0) {
    return FALLBACK_QUOTE;
  }

  // Select a random quote from the mood category
  const randomQuote = moodQuotes[Math.floor(Math.random() * moodQuotes.length)];
  return randomQuote;
};
