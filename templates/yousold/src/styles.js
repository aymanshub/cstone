/*
---
name: Youjoomla Mouseover Effect

description: allows mouseover/out effects on image stories

author: Youjoomla

license: This file is NOT licensed under any BSD or MIT style license.
         Unauthorised use, editing, distribution is not allowed.

copyright: Youjoomla LLC 2012

version: 1.0
*/

window.addEvent('load', function(){
	// HOLDER SHADOW
     $$('#centertop').setStyles({
       boxShadow: '0 0 10px 0 #d4d4d4',
       WebkitBoxShadow:'0 0 10px 0 #d4d4d4',
       MozBoxShadow:'0 0 10px 0 #d4d4d4'
    });	
	
	// IMAGES SHADOW
     $$('.Yousold_Slider,.ysyy .imageholder,div.catItemImageBlock,.subCategory .curtain,a.moduleItemImage,div.itemImageBlock,div.itemRelated li img').setStyles({
       boxShadow: '0px 0px 3px 1px #d8d8d8',
       WebkitBoxShadow:'0px 0px 3px 1px #d8d8d8',
       MozBoxShadow:'0px 0px 3px 1px #d8d8d8'
    });	
	//IMAGE HOVER EFFECT
	
$$('div.curtain').each(function(div){
   var width  = div.getElement('img.fadeimg').getSize().x;
   var height  = div.getElement('img.fadeimg').getSize().y;
   
   div.getElement('div.curtainImage').set('tween', {duration:'300'});
   div.getElement('div.cLeft').set('tween', {duration: '450'});
   div.getElement('div.cRight').set('tween', {duration: '450'});
   
   
   div.addEvent('mouseenter',function(e){
    this.getElement('div.cLeft').tween('left','-' + width/2 + 'px')
    this.getElement('div.cRight').tween('right','-' + width/2 + 'px')
    this.getElement('img.fadeimg').morph({opacity: [1,0.3]});
    
   });
   div.addEvent('mouseleave',function(e){
    this.getElement('div.cLeft').tween('left','0px')
    this.getElement('div.cRight').tween('right','0px')
    this.getElement('img.fadeimg').morph({opacity: [0.3,1]});
  
   });
  });
	
});



