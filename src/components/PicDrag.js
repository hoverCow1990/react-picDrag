import React, { PureComponent } from "react";
import { message } from "antd";

const DefaultStyle = {};

/**
 * 图片拖拽组件
 * @type {Object}
 * 用于div(等宽&&等高)拖拽后的排序
 * 每个div(图片)以绝对定位后, translate3d作为渲染定位的引擎 以提升webgl的加速性能 所以不支持低端浏览器
 */
export default class PicDrag extends PureComponent {
  constructor() {
    super();

    this.state = {
      wrapperWidth: 0, // 包住图片的外层的div宽度
      wrapperHeight: 0, // 包住图片的外层的div高度
      listStyle: [], // 每个被移动的div的style, 用于做div的渲染
      lastListStyle: [], // 在每次点击后被备份的一个当前listStyle, 最后组件拖拽中,其匹配相交面积最大的计算过程, 是以lastListStyle为标准
      moveIndex: null, // 当前被移动的div的所处listStyle中的index
      moveStyle: {}, // 记录被移动的div的鼠标初次点击后其的top以及left
      moveSwitch: true, // 是否可以被拖动的开关 用于控制图片在每次拖拽结束后有一段动画效果, 在动画效果期间不允许再次拖拽
      propList: [], // 最后返回出去的图片排序id 如 [2,1,3,4,5,6]
      transition: 0, // 图片移动的动画时间
      blankArea: null, // 最后一行空缺出来的面积div属性, 用于碰撞检测时, 移动div被拖动到最后一个位置放置到末尾
      // 记录在上一次移动中的div与哪一个index位置的div相交面积最大(与其交换)的值, 期间会比对lastMaxAreaIndex, 两次值一致时不会做过多运算
      lastMaxAreaIndex: -1
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.children) return;

    // 作为最后是否更新重新设置所有div样式的依据
    let isReSetListStyle = false;
    let isLengthChange = false;

    // 当子组件传入的children的个数不一样时必定重新计算style(比如新上传的图或者删除了某图)
    if (this.props.children.length !== nextProps.children.length) {
      isReSetListStyle = true;
      isLengthChange = true;
    }

    // 当子组件传入的children排序被更改时(比如重新排序后发完请求 需要对每个div重新定位)
    if (!isReSetListStyle) {
      for (let i = 0; i < this.props.children.length; i++) {
        // 每个children最好以图片的src作为key传入 不传也不影响 只是会影响部分性能
        if (this.props.children[i].key !== nextProps.children[i].key) {
          isReSetListStyle = true;
          break;
        }
      }
    }

    // isReSetListStyle 为 true 时,组件会重新重新计算每一个子div的定位,以及最外层的宽高
    if (isReSetListStyle) {
      if (isLengthChange) {
        setTimeout(() => {
          this.setListStyle(nextProps);
        }, 100);
      } else {
        this.setListStyle(nextProps);
      }
    }
  }

  resizeEvent = this.setListStyle.bind(this);

  bindMouseDown = this.onMouseDown.bind(this);

  bindMouseMove = this.onMouseMove.bind(this);

  bindMouseUp = this.onMouseUp.bind(this);

  componentDidMount() {
    // transition为div运动的动画时间,默认为0
    let transition = `${(this.props.transition || 0) / 1000}s`;

    // 将transition存起来,方便之后直接获取
    this.setState({
      transition
    });

    // 初次渲染后, 对每一个div的定位进行计算
    this.setListStyle(this.props);

    // 浏览器宽度调整时, 对每个div进行定位
    window.addEventListener("resize", this.resizeEvent);

    // 将div的事件委托在window上 以免由于鼠标在拖拽div时,由于某些单身狗的手速过快, div脱离出鼠标的问题
    window.addEventListener("mousedown", this.bindMouseDown);
    window.addEventListener("mousemove", this.bindMouseMove);
    window.addEventListener("mouseup", this.bindMouseUp);

    this.props.isHasRequest && this.valiKey();
  }

  // 组件摧毁时,解除所有window事件绑定
  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeEvent);
    window.removeEventListener("mousedown", this.bindMouseDown);
    window.removeEventListener("mousemove", this.bindMouseMove);
    window.removeEventListener("mouseup", this.bindMouseUp);
  }

  /**
   * 校验每个子元素的key值是否传入了src,并且是不同的
   */
  valiKey() {
    let isHttpKeys = true;
    let obj = {};

    for (let i = 0; i < this.props.children.length; i++) {
      let key = this.props.children[i].key;
      obj[key] = i;
      // 每个children最好以图片的src作为key传入 不传也不影响 只是会影响部分性能
      if (!/^https?/.test(this.props.children[i].key)) {
        isHttpKeys = false;
        break;
      }
    }

    if (!isHttpKeys) {
      return console.log(
        new TypeError("每个子元素必须以图片src作为key值, 不然可能导致程序混乱")
      );
    }

    if (Object.keys(obj).length !== this.props.children.length) {
      console.log(
        new TypeError("重复的图片路径作为key,可能会造成移动后的样式错误")
      );
    }
  }

  // 渲染整个组件
  render() {
    let { wrapperHeight } = this.state;

    return (
      <ul
        ref={ref => {
          this.wrapper = ref;
        }}
        className={this.props.className}
        style={{ position: "relative", height: `${wrapperHeight}px` }}
      >
        {this.renderChildren()}
      </ul>
    );
  }

  // 渲染可拖拽的li节点
  renderChildren() {
    let { listStyle } = this.state;

    // 将每一个div赋予listStyle内存的样式
    return React.Children.map(this.props.children, (child, i) =>
      React.cloneElement(child, {
        style: {
          position: "absolute",
          boxSizing: "border-box",
          ...listStyle[i]
        }
      })
    );
  }

  /**
   * 鼠标点击事件[其委托在window上]
   * @param  {Event} event事件
   */
  onMouseDown(e) {
    e.preventDefault();
    // e.target.tagName === 'IMG' 由于点击图片后需要做放大处理, 所以点击到图片后会不处理拖拽事件
    // moveSwitch 用于控制图片在每次拖拽结束后有一段动画效果, 在动画效果期间不允许再次拖拽
    // disableMove 作为父组件对图片是否能被拖拽的限制
    if (
      // e.target.tagName === "IMG" ||
      !this.state.moveSwitch ||
      this.props.disableMove
    )
      return;

    // 在排序后发送请求阶段, 不允许组件被拖拽
    if (this.props.isLoading) {
      return message.warn("请求中, 稍等片刻操作...");
    }

    // 获取组件的x轴以及y轴
    let { clientX, clientY } = e;

    this.setState(state => {
      let { moveStyle } = state;
      let {
        top,
        left,
        width: wrapperWidth,
        height: wrapperHeight
      } = this.getElemDis(this.wrapper); // 获取包裹div的外层wrapper属性
      let listStyle = state.listStyle.slice(); // 保存所有子div属性的数组
      let moveIndex = null; // 储存本次被点击到的div在listStyle下的index

      // 由于事件是被委托在window对象上, 所以以点击的x轴坐标, 以及y轴坐标来判定本次点击是否有命中子div身上
      for (let i = 0; i < listStyle.length; i++) {
        if (
          clientX > listStyle[i].calLeft + left &&
          clientX < listStyle[i].calLeft + left + listStyle[i].width &&
          clientY > listStyle[i].calTop + top &&
          clientY < listStyle[i].calTop + top + listStyle[i].height
        ) {
          // 命中div后 记录moveIndex 以及该div被移动前的所有属性
          moveIndex = i;
          moveStyle = {
            ...moveStyle,
            stX: clientX,
            stY: clientY,
            width: listStyle[i].width,
            height: listStyle[i].height,
            stTop: listStyle[i].calTop,
            stLeft: listStyle[i].calLeft
          };
          break;
        }
      }

      // 设置state
      return {
        lastListStyle: listStyle.slice(), // lastListStyle该对象用于div在拖拽中,匹配最后落地位置的依据
        moveStyle,
        moveIndex,
        wrapperStyle: {
          width: wrapperWidth,
          height: wrapperHeight
        },
        lastMaxAreaIndex: -1 // 每一次点击后将重置之前的lastMaxAreaIndex
      };
    });
  }

  /**
   * 鼠标移动时[其委托在window上]
   * @param  {Event} event事件
   */
  onMouseMove(e) {
    let { clientX, clientY } = e;
    let { state } = this;
    let {
      moveStyle,
      moveIndex,
      listStyle,
      lastListStyle,
      lastMaxAreaIndex
    } = state;

    // moveIndex为数字时 表示刚才的点击有命中子div null则表示没有命中 则不处理拖拽
    if (moveIndex === null) return;

    listStyle = listStyle.slice();

    let { stX, stY, stTop, stLeft } = state.moveStyle;
    let { width: wrapperWidth, height: wrapperHeight } = state.wrapperStyle;
    let calLeft = stLeft + (clientX - stX); // 计算移动中div的left值
    let calTop = stTop + (clientY - stY); // 计算移动中div的top值
    // 移动中的div的样式
    let newMoveStyle = {
      ...listStyle[moveIndex],
      transition: "0s", // 移动中不允许带transition
      calLeft,
      calTop,
      transform: `translate3d(${calLeft}px,${calTop}px, 0)`,
      zIndex: 999 // 将其层级放在最高层
    };

    // 出界校验(以外层wrapper的边界为范围)
    let isBoundary = this.testBoundary(
      newMoveStyle,
      wrapperWidth,
      wrapperHeight
    );

    if (isBoundary) {
      // 出界后进行回弹
      this.endMove(e);
      return;
    }

    // 相交面积校验(与某个位置的div的相交面积最大)
    let { maxArea, maxAreaIndex } = this.getCollisionInfo(
      newMoveStyle,
      moveIndex,
      lastListStyle
    );

    // 根据相交的位置,重新定位每个div的样式(translate3d)
    let { newListStyle, propList } = this.getNewListStyle({
      moveIndex,
      newMoveStyle,
      maxAreaIndex,
      lastListStyle,
      moveStyle,
      lastMaxAreaIndex,
      listStyle
    });

    this.setState({
      listStyle: newListStyle,
      lastMaxAreaIndex: maxAreaIndex,
      propList
    });
  }

  /**
   * 鼠标抬起时[其委托在window上]
   * @param  {Event} event事件
   */
  onMouseUp(e) {
    // moveIndex为null时,不处理最后的动画
    if (this.state.moveIndex === null) return;

    this.endMove(e);
  }

  endMove(e) {
    let {
      lastMaxAreaIndex,
      lastListStyle,
      listStyle,
      moveIndex,
      moveStyle,
      propList,
      transition
    } = this.state;
    let newListStyle = [];
    let newStyle = null; // 被移动的div最终的位置
    let timeout = 0;

    // 在所有动画完成后再进行处理样式和抛出onChange
    if (this.props.transition) {
      timeout = this.props.transition > 150 ? this.props.transition + 100 : 100;
    } else {
      timeout = 100;
    }

    // lastMaxAreaIndex不为-1时，表示有相交其他div,是需要交换位置的
    if (lastMaxAreaIndex !== -1) {
      newListStyle = listStyle.map((item, index) => {
        if (index === moveIndex) {
          // 获取被交换的div的样式
          let transStyle = lastListStyle[lastMaxAreaIndex];
          let calLeft = transStyle.calLeft;
          let calTop = transStyle.calTop;

          newStyle = {
            width: moveStyle.width,
            height: moveStyle.height,
            left: 0,
            top: 0,
            calLeft,
            calTop,
            transform: `translate3d(${calLeft}px,${calTop}px, 0)`,
            transition
          };

          return newStyle;
        }
        return item;
      });
    } else {
      // lastMaxAreaIndex为1时, 表示没有相交其他div, 将其回弹回初次点击记录下的位置
      newListStyle = listStyle.map((item, index) => {
        let calLeft = moveStyle.stLeft;
        let calTop = moveStyle.stTop;

        if (index === moveIndex) {
          newStyle = {
            width: moveStyle.width,
            height: moveStyle.height,
            left: 0,
            top: 0,
            calLeft,
            calTop,
            transform: `translate3d(${calLeft}px,${calTop}px, 0)`,
            transition
          };

          return newStyle;
        }
        return item;
      });
    }

    // 在动画完成后 重新设置listStyle 以及向父级组件抛出本轮完成排序的信息
    setTimeout(() => {
      this.setState({
        moveSwitch: true, // 再次打开允许拖拽
        listStyle: listStyle.map((item, index) => {
          if (index === moveIndex) {
            return {
              ...newStyle
            };
          }

          return {
            ...item
          };
        })
      });

      // 有相交的div的时候, 触发onChange事件将相交的数据抛出给父组件
      if (lastMaxAreaIndex !== -1) {
        this.props.onChange &&
          this.props.onChange({
            moveIndex,
            propList,
            targetIndex: lastMaxAreaIndex
          });
      }
    }, timeout);

    this.setState({
      moveIndex: null, // 将被移动的div index重置
      listStyle: newListStyle,
      moveSwitch: false // 动画结束,允许再次被拖拽
    });
  }

  /**
   * 边界检测(div被拖拽出边界后会回弹)
   * @param  {Object} moveStyle     被拖动的div的属性
   * @param  {Number} wrapperWidth  外层wrapper的宽度
   * @param  {Number} wrapperHeight 外层wrapper的高度
   * @return {Boolean} 是否出界
   */
  testBoundary(moveStyle, wrapperWidth, wrapperHeight) {
    if (
      moveStyle.calTop < -100 ||
      moveStyle.calLeft < -100 ||
      moveStyle.calLeft + moveStyle.width > wrapperWidth + 100 ||
      moveStyle.calTop + moveStyle.height > wrapperHeight + 100
    ) {
      return true;
    }
    return false;
  }

  /**
   * 两个div碰撞检测, 会返回是碰撞的index值(被交换的index值), 以及碰撞的交集面积
   * @param  {Object} moveBlock     被移动的div的样式
   * @param  {Number} moveIndex     被移动的div的index
   * @param  {Array} lastListStyle  用于检测被碰撞的div属性列表
   * @return {Number} maxArea       相交面积
   * @return {Number} maxAreaIndex  被交换的div的index
   */
  getCollisionInfo(moveBlock, moveIndex, lastListStyle) {
    let minArea = this.props.minArea || 0; // 父组件传入的最小相交面积值, 低于该值的都不算相交
    let { tl, tr, br, bl } = this.getHorn(moveBlock); // 获取移动中的div的[左上, 右上, 右下, 左下]的x以及y坐标
    let { blankArea } = this.state; // blankArea 为
    let maxArea = 0; // 相交面积
    let maxAreaIndex = -1; // 被交换的div的index

    for (let i = 0; i < lastListStyle.length; i++) {
      // 不校验移动div其本身
      if (i === moveIndex) continue;

      // 分别获取每一个div与移动div的相交面积
      let area = this.getAreaMeasure({ tl, tr, br, bl }, lastListStyle[i]);

      // 用于获取与哪一个div相交面积是最大的, 决定与哪一个div进行交换
      if (area && area > maxArea && area > minArea) {
        maxArea = area;
        maxAreaIndex = i;
      }
    }

    // 当没有与任何div相交时,校验其是否被放置在最后一行的留白空间, 若是, 则与最后一个图交换位置
    if (maxAreaIndex === -1 && blankArea !== null) {
      let area = this.getAreaMeasure({ tl, tr, br, bl }, blankArea);

      if (area && area > maxArea && area > minArea) {
        maxArea = area;
        maxAreaIndex = lastListStyle.length - 1;
      }
    }

    return {
      maxArea,
      maxAreaIndex
    };
  }

  /**
   * 根据碰撞结果, 更新ListStyle的样式
   * @param  {Number} moveIndex        被移动的div的index
   * @param  {Number} maxAreaIndex     将要被交换的div的index
   * @param  {Object} newMoveStyle     被移动的div的当前style
   * @param  {Array} lastListStyle     用于校验碰撞的div样式列表
   * @param  {Object} moveStyle        被移动的div初次点击时记录下的样式
   * @param  {Array} listStyle         当前渲染的div样式列表
   * @param  {Number} lastMaxAreaIndex 被交换的div的index
   * @return {Array} newListStyle      本次移动后产生的新的ListStyle
   * @return {Array} propList          本次移动后产生的新的排序数列表
   */
  getNewListStyle({
    moveIndex,
    maxAreaIndex,
    newMoveStyle,
    lastListStyle,
    moveStyle,
    listStyle,
    lastMaxAreaIndex
  }) {
    let transition = this.state.transition;
    let propList = [];
    let newListStyle = [];

    // 本次碰撞与上次碰撞的lastMaxAreaIndex值一样, 节约性能, 不重新计算所有div的属性
    if (lastMaxAreaIndex === maxAreaIndex) {
      // 只仅仅重设当前移动中的div属性(用于拖拽后的移动)
      newListStyle = listStyle.map((item, index) => {
        if (index === moveIndex) {
          return newMoveStyle;
        }
        return item;
      });

      return {
        newListStyle,
        propList: this.state.propList
      };
    }

    // 有碰撞到div
    if (maxAreaIndex !== -1) {
      for (let i = 0; i < lastListStyle.length; i++) {
        if (i === moveIndex) {
          // 移动的div其本身
          newListStyle.push(newMoveStyle);
          propList.push(maxAreaIndex);
          continue;
        }

        // 移动的div在被交换的div之前
        if (moveIndex < maxAreaIndex) {
          if (i <= maxAreaIndex && i > moveIndex) {
            // 处于被交换以及移动的div区间 往前走一格
            newListStyle.push({
              ...lastListStyle[i - 1],
              transition
            });

            propList.push(i - 1);
          } else {
            // 其余的不动
            newListStyle.push({
              ...lastListStyle[i],
              transition
            });

            propList.push(i);
          }
        } else if (i < moveIndex && i >= maxAreaIndex) {
          // div从后往前移动时 处于被交换div以及移动的div区间内的板块往后移动一层
          newListStyle.push({
            ...lastListStyle[i + 1],
            transition
          });

          propList.push(i + 1);
        } else {
          // 剩下的所有不动
          newListStyle.push({
            ...lastListStyle[i],
            transition
          });

          propList.push(i);
        }
      }
    } else {
      // 没有碰撞到其余div
      newListStyle = lastListStyle.map((item, index) => {
        if (index === moveIndex) {
          return newMoveStyle;
        }
        return item;
      });
    }

    return {
      newListStyle,
      propList
    };
  }

  /**
   * 获取两个div相交部分的面积
   * @param  {Object} moveBlock 移动的div属性
   * @param  {Object} testBlock 被校验的div
   * @return {Number}           返回相交的面积
   */
  getAreaMeasure(moveBlock, testBlock) {
    let blockWidth = testBlock.width;

    let r1 = moveBlock.br.x;
    let r2 = testBlock.calLeft + testBlock.width;
    let l1 = moveBlock.bl.x;
    let l2 = testBlock.calLeft;
    let t1 = moveBlock.tl.y;
    let t2 = testBlock.calTop;
    let b1 = moveBlock.bl.y;
    let b2 = testBlock.calTop + testBlock.height;

    if (b1 < t2 || t1 > b2 || r1 < l2 || l1 > r2) {
      return 0;
    }

    let dw = r1 < r2 ? r1 - l2 : r2 - l1;
    let dh = b1 < b2 ? b1 - t2 : b2 - t1;

    return dw * dh;
  }

  getHorn(moveStyle) {
    let { width, height, calLeft: left, calTop: top } = moveStyle;

    return {
      tl: {
        x: left,
        y: top
      },
      tr: {
        x: left + width,
        y: top
      },
      br: {
        x: left + width,
        y: top + height
      },
      bl: {
        x: left,
        y: top + height
      }
    };
  }

  setListStyle() {
    if (!this.wrapper) return;

    let listStyle = [];
    let $li = this.wrapper.children;

    if (!$li || !$li[0]) return;

    let left = 20;
    let wrapperWidth = this.wrapper.offsetWidth;
    let wrapperHeight = 0;
    let rowCount = 0;
    let columnCount = 0;
    let moveSize = 0;
    let $liWidth = $li[0].offsetWidth;
    let $liHeight = $li[0].offsetHeight;

    for (let i = 0; i < $li.length; i++) {
      let $child = $li[i];
      let leftStyle = left + 20 * (i - moveSize);

      if (leftStyle + $liWidth > wrapperWidth - 20) {
        rowCount++;
        leftStyle = 20;
        left = 20 + $liWidth;
        moveSize = i;
      } else {
        left += $liWidth;
      }

      if (rowCount === 0) columnCount++;

      let calLeft = leftStyle;
      let calTop = 20 + rowCount * (20 + $liHeight);

      listStyle.push({
        width: $liWidth,
        height: $liHeight,
        left: 0,
        top: 0,
        calLeft,
        calTop,
        transition: this.state.transition,
        transform: `translate3d(${calLeft}px,${calTop}px, 0)`
      });
    }

    let leftBlank = columnCount - ($li.length % columnCount);
    let newState = {
      listStyle,
      wrapperHeight: 20 + (rowCount + 1) * (20 + $liHeight)
    };

    if (leftBlank !== 0) {
      newState.blankArea = {
        width: ($liWidth + 20) * leftBlank,
        height: $liHeight,
        left: 0,
        top: 0,
        calLeft: left + 20 * ($li.length - moveSize),
        calTop: 20 + rowCount * (20 + $liHeight)
      };
    } else {
      newState.blankArea = null;
    }

    this.setState(newState);
  }

  // 获取某个元素对于
  getElemDis(el) {
    let tp = document.documentElement.clientTop;
    let lt = document.documentElement.clientLeft;

    let rect = el.getBoundingClientRect();
    let width = el.offsetWidth;
    let height = el.offsetHeight;
    // console.log(el);
    return {
      width,
      height,
      top: rect.top - tp,
      right: rect.right - lt,
      bottom: rect.bottom - tp,
      left: rect.left - lt
    };
  }
}
