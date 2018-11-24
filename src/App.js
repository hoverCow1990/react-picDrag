import React, { PureComponent } from "react";
import { Button, Card, Checkbox, Icon, message } from "antd";
import PicDrag from "./components/PicDrag.js";
import styles from "./app.less";

class HouseTypeManagement extends PureComponent {
  constructor() {
    super();

    this.state = {
      imgList: [
        {
          category: "0",
          title: "首图",
          imageList: [
            {
              url:
                "http://www.web-jackiee.com/uploads/article/2018-11-23/534dc3d5a0502d98f8a60d17287a9860.jpg",
              classType: "w",
              text: "react图片拖拽",
              isSelect: false
            },
            {
              url:
                "http://www.web-jackiee.com/uploads/article/2018-04-22/9e83008475a63e7f11133a91e1b52a55.jpg",
              classType: "w",
              text: "区块链技术",
              isSelect: false
            },
            {
              url:
                "http://www.web-jackiee.com/uploads/article/2018-05-09/b3924ff7eac2d94a2386d2b7258ad804.jpg",
              classType: "w",
              text: "细数Vue中的小常识",
              isSelect: false
            },
            {
              url:
                "http://www.web-jackiee.com/uploads/article/2018-05-11/525d65d500f951adb5310be9c38d805e.jpg",
              classType: "w",
              text: "Mac快捷键",
              isSelect: false
            },
            {
              url:
                "http://www.web-jackiee.com/uploads/article/2018-03-21/29f9b1cbc287a6065c95b3045b508b39.jpg",
              classType: "w",
              text: "实用文档类归纳",
              isSelect: false
            },
            {
              url:
                "http://www.web-jackiee.com/uploads/article/2018-06-01/9866c6da92df8d0309ea6afa4503be2d.jpg",
              classType: "w",
              text: "白鹭爬坑一",
              isSelect: false
            },
            {
              url:
                "http://www.web-jackiee.com/uploads/article/2018-03-16/eaf4aefc8afe9620d32f66270dd58270.jpg",
              classType: "w",
              text: "atom实用插件",
              isSelect: false
            },
            {
              url:
                "http://www.web-jackiee.com/uploads/article/2018-03-11/1b608872a81b5e4cbd669035e40986be.jpg",
              classType: "w",
              text: "ps批处理",
              isSelect: false
            },
            {
              url:
                "http://www.web-jackiee.com/uploads/article/2018-03-24/69d2eb85962368e6aeecc60b5dd7498a.jpg",
              classType: "w",
              text: "gulp的初级",
              isSelect: false
            },
            {
              url:
                "http://www.web-jackiee.com/uploads/article/2018-03-12/4bde74614e26cf4fcfb566a48502362b.jpg",
              classType: "w",
              text: "14年在春秋",
              isSelect: false
            },
            {
              url:
                "http://www.web-jackiee.com/uploads/article/2018-03-04/2925bc862f7e0a987425a0e595f69900.jpg",
              classType: "w",
              text: "捕鱼达人[响应式]",
              isSelect: false
            },
            {
              url:
                "http://www.web-jackiee.com/uploads/article/2018-03-10/58581c677c498dc8303d23d57185a505.jpg",
              classType: "w",
              text: "路径文件名以及内存",
              isSelect: false
            },
            {
              url:
                "http://www.web-jackiee.com/uploads/article/2018-03-10/3f41339de90639c19dcaee5bc549ea10.jpg",
              classType: "w",
              text: "排序以及集合",
              isSelect: false
            },
            {
              url:
                "http://www.web-jackiee.com/uploads/article/2018-03-09/fd0df0cc5122a202f5ef50d8799d76a6.jpg",
              classType: "w",
              text: "进制转换",
              isSelect: false
            }
          ]
        },
        {
          category: "1",
          title: "洗澡图",
          imageList: [
            {
              url:
                "http://www.web-jackiee.com/uploads/article/2018-05-11/525d65d500f951adb5310be9c38d805e.jpg",
              classType: "w",
              text: "Mac快捷键",
              isSelect: false
            },
            {
              url:
                "http://www.web-jackiee.com/uploads/article/2018-03-04/2925bc862f7e0a987425a0e595f69900.jpg",
              classType: "w",
              text: "捕鱼达人[响应式]",
              isSelect: false
            },
            {
              url:
                "http://www.web-jackiee.com/uploads/article/2018-03-10/3f41339de90639c19dcaee5bc549ea10.jpg",
              classType: "w",
              text: "排序以及集合",
              isSelect: false
            }
          ]
        },
        {
          category: "2",
          title: "出浴图",
          imageList: [
            {
              url:
                "http://www.web-jackiee.com/uploads/article/2018-03-10/7f3219a396c3f36c5b54b646cdfd04fd.jpg",
              classType: "w",
              text: "位运算篇",
              isSelect: false
            },
            {
              url:
                "http://www.web-jackiee.com/uploads/article/2018-03-09/e5b5de706d6d255f3681550cfffc2aee.jpg",
              classType: "w",
              text: "js高级程序设计",
              isSelect: false
            },
            {
              url:
                "http://www.web-jackiee.com/uploads/article/2018-03-24/d2ab5b94e3a5dcce7a02f29fd7527060.jpg",
              classType: "w",
              text: "Js闭包浅析",
              isSelect: false
            },
            {
              url:
                "http://www.web-jackiee.com/uploads/article/2018-03-22/08a6464d404ab5e37541bc5364ba74d8.jpg",
              classType: "w",
              text: "cookie以及localStorage",
              isSelect: false
            }
          ]
        },
        {
          category: "3",
          title: "不给你看的图",
          imageList: []
        }
      ],
      editType: true,
      selectSortIndex: -1,
      isLoadSort: false
    };
  }

  render() {
    let {
      imgList,
      isImgLoad,
      selectImgIdList,
      hotelId,
      isShowUploadModel,
      isChangeCategoryModel,
      isChangeCategoryloading,
      isLoadSort,
      editType
    } = this.state;

    return (
      <div className={styles.page}>
        <Card className={styles.housePic}>
          <div className={styles.housePicButtonList}>
            <Button type="primary" onClick={() => this.removeImage()}>
              批量删除
            </Button>
            <Button
              type={editType ? "primary" : "default"}
              style={{ marginLeft: 10 }}
              onClick={() => this.setState({ editType: !editType })}
            >
              {editType ? "可以移动" : "不可移动"}
            </Button>
          </div>
          <div className={styles.housePicWrapper}>
            <ul>
              {imgList.map((item, index) => (
                <li className={styles.housePicContainer} key={item.category}>
                  <p className={styles.housePicTitle}>
                    <Icon type="menu-unfold" theme="outlined" />
                    {item.title}
                  </p>
                  {item.imageList.length ? (
                    <PicDrag
                      ref={ref => {
                        this[`picDrag${index}Ref`] = ref;
                      }}
                      className={styles.housePicList} // 类名
                      transition={350} // 每次移动的动画效果时间 不传则没有动画效果
                      minArea={5000} // 组件以相交面积大小判断是否碰撞 其为最小碰撞面积 不传任何覆盖都表示碰撞
                      isHasRequest={true} // 移动顺序后是否存在请求的过程
                      isLoading={isLoadSort} // 是否在请求
                      onChange={op => this.handlerPicSort(op, item.category)} // 会抛出交换后的数据
                      disableMove={!editType} // 是否可以拖拽
                    >
                      {item.imageList.map((img, i) => (
                        <li
                          className={styles.housePicBox}
                          key={img.url}
                          onMouseDown={() => this.changeListIndex(index)}
                        >
                          <div
                            className={`${styles.perview} ${styles[
                              img.classType
                            ] || styles.perviewW}`}
                          >
                            <Checkbox
                              disabled={!editType}
                              onClick={() =>
                                this.onSelectPic(index, i, img.imageId)
                              }
                              checked={img.isSelect}
                            />
                            <img src={img.url} alt="" />
                          </div>
                          <div className={styles.info}>{img.text}</div>
                        </li>
                      ))}
                    </PicDrag>
                  ) : (
                    <ul className={styles.housePicList}>
                      <li>暂无图片...</li>
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    );
  }

  removeImage = (index, i) => {
    let PicList = this.state.imgList.map(item => {
      return {
        ...item,
        imageList: item.imageList.filter(img => !img.isSelect)
      };
    });

    this.setState({
      imgList: PicList
    });
  };

  handlerPicSort = async (op, category) => {
    let PicList = this.state.imgList.slice();
    let PicData = PicList.find(item => item.category === category);
    let { selectSortIndex } = this.state;

    if (PicData) {
      let imageList = PicData.imageList.slice();
      let { propList } = op;
      let newPicList = [];

      propList.forEach((item, index) => {
        newPicList[item] = imageList[index];
      });

      PicList = PicList.map((item, index) => {
        if (index !== selectSortIndex) return item;

        return {
          ...item,
          imageList: newPicList
        };
      });

      this.setState({
        isLoadSort: true
      });

      message.info("请求中...");

      await new Promise(reslove => {
        setTimeout(() => {
          reslove();
        }, 500);
      });

      message.success("请求结束");

      setTimeout(() => {
        // this[`picDrag${selectSortIndex}Ref`].setListStyle();
        this.setState({
          isLoadSort: false,
          imgList: PicList
        });
      }, 200);
    }
  };

  changeListIndex(index) {
    this.setState({
      selectSortIndex: index
    });
  }

  onSelectPic = (index, i, imageId) => {
    let PicList = this.state.imgList.slice();

    PicList[index].imageList[i].isSelect = !PicList[index].imageList[i]
      .isSelect;

    this.setState({
      imgList: PicList
    });
  };
}

export default HouseTypeManagement;
