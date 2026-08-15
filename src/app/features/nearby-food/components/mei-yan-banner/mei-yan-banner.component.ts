import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DragDropModule } from '@angular/cdk/drag-drop';

export interface FoodQuote {
  id: number;
  tag: string;
  quote: string;
}

const ALL_QUOTE_TEXTS: string[] = [
  '翠绿香浓的斑兰戚风，是开启一天美妙心情的最佳甜点。',
  '椰香与斑兰交织的 Onde-onde，每一口都是满满爆浆的幸福感。',
  '一杯浓郁的南洋白咖啡，搭配刚出炉的斑兰吐司，元气满满！',
  '探索周边地道美食，让香浓美食治愈一切日常疲惫。',
  '斑兰香气扑鼻，跟随美食地图发现身边的藏宝好店。',
  '香脆黄油吐司与地道半熟蛋，早餐就要这样充沛满足。',
  '椰浆饭的辣酱与班兰米饭，构成了马来西亚最地道的美味名片。',
  '寻找附近高分评价的古早味档口，品尝岁月沉淀的好风味。',
  '一碗清凉解暑的冰爽 Cendol，淋上浓郁黑糖，夏日绝配！',
  '手作 Nyonya Kuih 的细腻口感，承载着温暖的传统美味。',
  '炭火慢烤的斑兰咖央角，皮酥馅香，令人回味无穷。',
  '在城市的街头巷尾，总有一份热气腾腾的美食在等待着你。',
  '黄金流沙包与热气腾腾的点心，开启充满活力的早晨！',
  '刚炸好的金黄斑兰华夫饼，散发着诱人的植物清香。',
  '寻找附近藏在巷弄里的高分精品咖啡馆，细品豆香。',
  '经典肉骨茶配上特制油条，汤头浓郁，温暖胃与心灵。',
  '香辣镬气十足的炒粿条，是街头美食的不二之选。',
  '浓郁椰奶与斑兰叶焖煮的香米，每一粒都饱含深情。',
  '酥脆可口的大蛋挞，奶香与蛋香在舌尖完美融合。',
  '在清晨探索附近的早市档口，感受最接地气的人文烟火。',
  '鲜美地道的叻沙汤底，酸辣交织，让人过瘾十足。',
  '斑兰印尼糕（Lapis）层层叠叠，象征着层层递进的甜蜜。',
  '一杯香浓奶茶，开启悠闲的下午茶舒心时光。',
  '搜罗城市里的独立烘焙坊，寻找刚出炉的斑兰手作面包。',
  '印度煎饼（Roti Canai）搭配热咖喱，外酥内软美味非凡。',
  '每一份精致的本地甜品，都是对生活细致入微的爱意。',
  '浓郁黑糖与新鲜椰丝的结合，勾勒出南洋特色甜味。',
  '在忙碌的日子里，别忘了给味蕾安排一场小小的旅行。',
  '香浓斑兰千层糕，细腻绵软，口齿留香。',
  '探索附近高评分餐厅，与亲朋好友分享好滋味。',
  '一碗热气腾腾的海南鸡饭，鸡肉滑嫩，油饭香浓。',
  '斑兰冰淇淋搭配香脆坚果，清凉解暑，口感丰富。',
  '城市角落里的老字号冰室，保留着最纯粹的怀旧风味。',
  '独家推荐的斑兰巴斯克芝士蛋糕，浓郁芝士遇上植物清香。',
  '爽口弹牙的云吞面，配上秘制叉烧，经典常新。',
  '寻找附近步行范围内最受喜爱的优质早餐点。',
  '一杯高颜值生椰斑兰拿铁，带来视觉与味觉的双重享受。',
  '刚烤好的斑兰曲奇饼干，清香扑鼻，酥松适口。',
  '街角小摊的香烤沙爹，肉质嫩滑，花生酱浓郁香甜。',
  '发现身边的地道甜品店，用甜美味道丰富午后心情。',
  '浓郁咖喱面配上丰富食材，每一口都是满足感。',
  '斑兰瑞士卷配上轻盈奶油，口感如云朵般绵密。',
  '探索附近最新入驻的热门好评美食榜单。',
  '一份地道的九层糕，软糯Q弹，色彩斑斓。',
  '香浓可可配上斑兰松饼，碰撞出别具一格的美味火花。',
  '晨光初照，跟着美食雷达去品尝第一缕好滋味。',
  '秘制卤肉饭肥而不腻，酱汁浓郁，下饭绝配。',
  '斑兰豆浆烧仙草，滑嫩清爽，低糖少负担。',
  '附近优质好店一键定位，再也不用纠结今天吃什么。',
  '爽滑炒河粉配上鲜嫩牛肉，镬气满满，真材实料。',
  '斑兰西米露甜汤，冰镇过后格外沁人心脾。',
  '在平淡的日常里，用一道好菜唤醒生活的新鲜感。',
  '地道酿豆腐配上鲜美清汤，原汁原味，健康美味。',
  '斑兰大福麻薯，皮薄馅靓，软糯拉丝。',
  '发现身边好评如潮的特色火锅与精致小吃档。',
  '黄金香酥炸鸡配上特制蘸酱，外脆里嫩令人垂涎。',
  '斑兰水果塔，新鲜水果与清香挞皮的完美二重奏。',
  '精选优质食材，用心搜罗附近每一家品质小店。',
  '热腾腾的煲仔饭，饭焦香脆，酱汁浓郁入味。',
  '斑兰奶泡咖啡，带来层层递进的特调风味。',
  '阳光明媚的周末，探索附近的露天花园餐厅。',
  '秘制冬荫功汤，酸辣鲜美，瞬间打开味蕾欲望。',
  '斑兰雪花冰，细软如雪，入口即化。',
  '寻找周边地道打卡点，品味城市独有的饮食文化。',
  '刚出炉的斑兰葡式蛋挞，焦香诱人，挞心嫩滑。',
  '一碗鲜美无比的鱼头米粉，汤头奶白浓郁。',
  '斑兰蒸蛋糕，低脂健康，保留最纯粹的植物本香。',
  '定位身边的温馨小馆，享受属于自己的惬意用餐时光。',
  '烤至金黄的蒜香面包配浓汤，简单而又温暖治愈。',
  '斑兰布丁配上焦糖酱，滑嫩细腻，甜而不腻。',
  '探索附近高性价比的超值午餐与特色便当。',
  '浓郁芝士焗海鲜，拉丝香浓，每一口都是奢华体验。',
  '斑兰椰蓉球，椰香浓郁，小巧精致。',
  '无论是热闹街市还是幽静小巷，美味总在不经意间出现。',
  '香辣爽口的阿参叻沙，汤底浓郁，让人欲罢不能。',
  '斑兰马卡龙，将法式精致与南洋风味巧妙结合。',
  '搜罗附近好口碑的日式拉面与居酒屋小吃。',
  '外酥里嫩的炸虾饼，配上特制辣椒酱，过瘾至极。',
  '斑兰舒芙蕾厚松饼，摇晃诱人，轻盈柔润。',
  '每一道被推荐的美食，都凝聚着地道的制作匠心。',
  '鲜甜可口的水果刨冰，满载夏日清凉记忆。',
  '斑兰泡芙配上特调馅料，一口爆浆，惊喜满满。',
  '探索附近高分精致西餐厅，享受浪漫晚餐体验。',
  '香气四溢的黄姜饭配咖喱鸡，风味独特令人难忘。',
  '斑兰拿破仑酥，层层酥脆，奶油香浓。',
  '在美好的早晨，用一份丰盛早餐开启一天的好心情。',
  '热气腾腾的生滚海鲜粥，鲜美绵密，暖心暖胃。',
  '斑兰玛德琳蛋糕，小巧可爱，伴手礼最佳选择。',
  '寻找身边地道烧腊档，品尝皮脆肉嫩的烧鸭烧肉。',
  '斑兰木塞蛋糕（Trifle），层层风味，视觉与味觉双重享受。',
  '探索附近特色泰式料理，体验酸辣浓郁的异国风味。',
  '香酥可口的斑兰春卷，内馅丰富，口感层次分明。',
  '每一家值得推荐的店，都有其独一无二的主打好菜。',
  '斑兰大理石磅蛋糕，纹理优雅，茶点绝配。',
  '寻找附近支持外带的精品手冲咖啡与甜品店。',
  '刚炸出来的香脆番薯丸配斑兰蘸酱，怀旧味十足。',
  '斑兰甜心甜甜圈，外润内软，甜度适中。',
  '跟着美食雷达探索城市，发现身边的微小美好。',
  '斑兰香气与城市烟火气完美融合，祝您用餐愉快！'
];

@Component({
  selector: 'app-mei-yan-banner',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, DragDropModule],
  templateUrl: './mei-yan-banner.component.html',
  styleUrls: ['./mei-yan-banner.component.scss']
})
export class MeiYanBannerComponent implements OnInit, OnDestroy {
  quotes: FoodQuote[] = [];
  currentIndex = signal<number>(0);
  isCollapsed = signal<boolean>(true);

  private timerId: ReturnType<typeof setInterval> | null = null;
  private isDragging = false;

  ngOnInit(): void {
    this.quotes = this.selectRandomQuotes();
    this.startAutoCycle();
  }

  ngOnDestroy(): void {
    this.clearAutoCycle();
  }

  private selectRandomQuotes(): FoodQuote[] {
    const tags = ['MY 阳光灿烂', '斑兰美馔', '地道美馔', '甜品与下午茶', '城市寻味', '元气能量'];
    const shuffled = [...ALL_QUOTE_TEXTS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4).map((text, idx) => ({
      id: idx + 1,
      tag: tags[idx % tags.length],
      quote: text
    }));
  }

  private startAutoCycle(): void {
    this.timerId = setInterval(() => {
      this.nextQuote();
    }, 7000);
  }

  private clearAutoCycle(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  nextQuote(): void {
    if (this.quotes.length === 0) return;
    const nextIdx = (this.currentIndex() + 1) % this.quotes.length;
    this.currentIndex.set(nextIdx);
  }

  prevQuote(): void {
    if (this.quotes.length === 0) return;
    const prevIdx = (this.currentIndex() - 1 + this.quotes.length) % this.quotes.length;
    this.currentIndex.set(prevIdx);
  }

  setIndex(index: number): void {
    if (index >= 0 && index < this.quotes.length) {
      this.currentIndex.set(index);
    }
  }

  collapse(): void {
    this.isCollapsed.set(true);
  }

  expand(): void {
    this.isCollapsed.set(false);
  }

  onDragStarted(): void {
    this.isDragging = true;
  }

  onDragEnded(): void {
    setTimeout(() => {
      this.isDragging = false;
    }, 150);
  }

  onDiscClick(): void {
    if (!this.isDragging) {
      this.expand();
    }
  }
}
