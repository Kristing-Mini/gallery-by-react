require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';

var imageDatas = require('../data/imageDatas.json');

// 利用自执行函数，将图片名信息转成图片URL路径信息
imageDatas = (function getImageURL(imageDatasArr){
	for(var  i = 0, j=imageDatasArr.length; i<j; i++){
		var singleImageData = imageDatasArr[i];

		singleImageData.imageURL = require('../images/'+singleImageData.fileName);
		imageDatasArr[i] = singleImageData;
	}
	return imageDatasArr;
})(imageDatas);

// 获取区间内的随机值
function getRangeRandom(low,high){
  return Math.ceil(Math.random() * (high - low) + low);
  console.log('done!');
}
// 获取0到30之间的一个任意正负值
function get30DegRandom(){
  return ((Math.random() > 0.5 ? '' : '-') + Math.ceil(Math.random() * 30 ));
}

class ImgFigure extends React.Component{
  // imgFigure的点击处理函数
  handleClick(e){
    this.props.inverse();
    if(this.props.arrange.isInverser){
      
    }
    e.stopPropagation();
    e.preventDefault();
  };
  render(){
    var styleObj = {};
    console.log(styleObj);

    // if props属性中指定了这张图片的位置，则使用
    if(this.props.arrange.pos){
      styleObj = this.props.arrange.pos;
    }

    // 如果图片的旋转角度有值且不为0，添加旋转角度
    if(this.props.arrange.rotate){
      (['-moz-','-ms','-webkit-','']).forEach(function(value){
           styleObj[value + 'transform'] = 'rotate(' + this.props.arrange.rotate +'deg)';
      }.bind(this));
     
    }

    var imgFigureClassName = "img-figure";
    imgFigureClassName += this.props.arrange.isInverser?'is-inverse':'';


    return(
        <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
          <img src ={this.props.data.imageURL} alt={this.props.data.title}/>
          <figcaption>
            <h2 className="img-title">{this.props.data.title}</h2>
            <div className="img-back" onClick={this.handleClick}>
              <p>{this.props.data.desc}</p>
            </div>
          </figcaption>
        </figure>
      );
  }
};


class AppComponent extends React.Component {
// 翻转图片
// @para index输入当前被执行inverse操作的图片对应的图片信息数组的index值
// @return {Function} 闭包
inverse(index){
  return function(){
    var imgsArrangeArr = this.state.imgsArrangeArr;

    imgsArrangeArr[index].isInverser = !imgsArrangeArr[index].isInverser;
    this.setState({
      imgsArrangeArr:imgsArrangeArr
    });
  }.bind(this);
};



// 重新布局所有图片
// @para
  rearrange(centerIndex){
    var imgsArrangeArr = this.state.imgsArrangeArr,
    Constant = this.Constant,
    centerPos = Constant.centerPos,
    hPosRange = Constant.hPosRange,
    vPosRange = Constant.vPosRange,
    hPosRangeLeftSecX = hPosRange.leftSecX,
    hPosRangeRightSecX = hPosRange.rightSecX,
    hPosRangeY = hPosRange.y,
    vPosRangeTopY = vPosRange.topY,
    vPosRangeX = vPosRange.x,

    imgsArrangeTopArr = [],
    topImgNum = Math.ceil(Math.random() * 2),
    topImgSpliceIndex = 0,

    imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex,1);



    // 居中centerIndex的图片,不需要旋转
    imgsArrangeCenterArr[0].pos = centerPos;
    imgsArrangeCenterArr[0].rotate = 0;

    // 取出要布局上侧的图片的状态信息
    console.log(imgsArrangeArr.length);
    topImgSpliceIndex =  Math.ceil(Math.random() * (imgsArrangeArr.length - topImgNum));
    imgsArrangeTopArr = imgsArrangeArr.splice(
      topImgSpliceIndex,topImgNum);

    // 布局位于上侧的图片
    console.log(topImgNum);
    console.log(imgsArrangeArr.length);
    imgsArrangeTopArr.forEach(function(value,index){
      imgsArrangeTopArr[index]= {
        pos:{
          top:getRangeRandom(vPosRangeTopY[0],vPosRangeTopY[1]),
          left:getRangeRandom(vPosRangeX[0],vPosRangeX[1])
        },
        rotate:get30DegRandom()      
      }
    });

    // 左右侧
    for(var i = 0 , j = imgsArrangeArr.length, k = j / 2; i < j; i++){
      var hPosRangeLORX = null;
      // 前半部分布局左边，右半部分布局右边
      if(i<k){
        hPosRangeLORX = hPosRangeLeftSecX;
      } else {
        hPosRangeLORX = hPosRangeRightSecX;
      }

      imgsArrangeArr[i] = {
        pos: {
          top:getRangeRandom(hPosRangeY[0],hPosRangeY[1]),
          left:getRangeRandom(hPosRangeLORX[0],hPosRangeLORX[1])
        },
        rotate: get30DegRandom()
       
      };
    }

    if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
      imgsArrangeArr.splice(topImgSpliceIndex,0,imgsArrangeTopArr[0]);
    }
    imgsArrangeArr.splice(centerIndex,0,imgsArrangeCenterArr[0]);

    // 触发重新渲染
    this.setState({imgsArrangeArr:imgsArrangeArr});
  };

  constructor(props) {
    super(props);
    this.state = {imgsArrangeArr: props.initialimgsArrangeArr};
    this.Constant = {
    centerPos:{
      left:0,
      right:0
    },
    // 水平方向的取值范围
    hPosRange:{ 
      leftSecX:[0,0],
      rightSecX:[0,0],
      y:[0,0]
    },
    // 垂直方向的取值范围
    vPosRange:{
      x:[0,0],
      topY:[0,0]
    }
  };
  }

  
  // 组件加载以后，为每张图片计算其位置的范围
  componentDidMount(){
     var stageDom = ReactDOM.findDOMNode(this.refs.stage),
     stageW=stageDom.scrollWidth,
     stageH = stageDom.scrollHeight,
     halfStageW = Math.ceil(stageW / 2),
     halfStageH = Math.ceil(stageH / 2);

     // 拿到一个imageFigure的大小
     var imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
     imgW = imgFigureDOM.scrollWidth,
     imgH = imgFigureDOM.scrollHeight,
     halfImgW = Math.ceil(imgW / 2),
     halfImgH = Math.ceil(imgH / 2);

     // 中心
     this.Constant.centerPos = {
      left:halfStageW - halfImgW,
      top:halfStageH - halfImgH
     };

     // 左侧，右侧
     this.Constant.hPosRange.leftSecX[0] = -halfImgW;
     this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
     this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
     this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
     this.Constant.hPosRange.y[0] = -halfImgH;
     this.Constant.hPosRange.y[1] = stageH - halfImgH;

     // 上侧
     this.Constant.vPosRange.topY[0] = -halfImgH;
     this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;

     this.Constant.vPosRange.x[0] = halfStageW-imgW;
     this.Constant.vPosRange.x[1] = halfStageW;

     this.rearrange(0);
 
  };

  render() {
    var controllerUnits = [],
    ImgFigures=[];

    imageDatas.forEach(function(value,index){

      if(!this.state.imgsArrangeArr[index]){
        this.state.imgsArrangeArr[index]={
          pos:{
            left:0,
            top:0
          },
          rotate:0,
          isInverser:false  //图片正反面
        }
      };

      ImgFigures.push(<ImgFigure data={value} key={index} ref={'imgFigure'+ index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index).bind(this)}/>);
    }.bind(this));

    return (
      <section	className="stage" ref="stage">
      	<section className="img-sec">
          {ImgFigures}
      	</section>
      	<nav className="controller-nav">
          {controllerUnits}
        </nav>
      </section>
    );
  }
}

AppComponent.defaultProps = {initialimgsArrangeArr:[{}]};


export default AppComponent;
