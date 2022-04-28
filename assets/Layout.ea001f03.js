import{s as B,e as T,t as I,x as m,f as C,g as L,d as x,u as y,y as g,j as R,z as j,k as z,l as O,n as b,A as $,B as P,c as p}from"./index.3b0f20a1.js";const w=d=>{const{baseColor:e,textColor2:o,bodyColor:t,cardColor:l,dividerColor:r,actionColor:c,scrollbarColor:h,scrollbarColorHover:f,invertedColor:s}=d;return{textColor:o,textColorInverted:"#FFF",color:t,colorEmbedded:c,headerColor:l,headerColorInverted:s,footerColor:c,footerColorInverted:s,headerBorderColor:r,headerBorderColorInverted:s,footerBorderColor:r,footerBorderColorInverted:s,siderBorderColor:r,siderBorderColorInverted:s,siderColor:l,siderColorInverted:s,siderToggleButtonBorder:`1px solid ${r}`,siderToggleButtonColor:e,siderToggleButtonIconColor:o,siderToggleButtonIconColorInverted:o,siderToggleBarColor:m(t,h),siderToggleBarColorHover:m(t,f),__invertScrollbar:"true"}},E=B({name:"Layout",common:T,peers:{Scrollbar:I},self:w});var F=E,N=C("layout",`
 color: var(--n-text-color);
 background-color: var(--n-color);
 box-sizing: border-box;
 position: relative;
 z-index: auto;
 flex: auto;
 overflow: hidden;
 transition:
 box-shadow .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
`,[C("layout-scroll-container",`
 overflow-x: hidden;
 box-sizing: border-box;
 height: 100%;
 `),L("absolute-positioned",`
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 `)]);const V={type:String,default:"static"},k={embedded:Boolean,position:V,nativeScrollbar:{type:Boolean,default:!0},scrollbarProps:Object,onScroll:Function,contentStyle:{type:[String,Object],default:""},hasSider:Boolean,siderPlacement:{type:String,default:"left"}},H=P("n-layout");function S(d){return x({name:d?"LayoutContent":"Layout",props:Object.assign(Object.assign({},y.props),k),setup(e){const o=g(null),t=g(null),{mergedClsPrefixRef:l,inlineThemeDisabled:r}=R(e),c=y("Layout","-layout",N,F,e,l);function h(u,n){if(e.nativeScrollbar){const{value:i}=o;i&&(n===void 0?i.scrollTo(u):i.scrollTo(u,n))}else{const{value:i}=t;i&&i.scrollTo(u,n)}}j(H,e);const f={display:"flex",flexWrap:"nowrap",width:"100%",flexDirection:"row"},s={scrollTo:h},v=z(()=>{const{common:{cubicBezierEaseInOut:u},self:n}=c.value;return{"--n-bezier":u,"--n-color":e.embedded?n.colorEmbedded:n.color,"--n-text-color":n.textColor}}),a=r?O("layout",void 0,v,e):void 0;return Object.assign({mergedClsPrefix:l,scrollableElRef:o,scrollbarInstRef:t,hasSiderStyle:f,mergedTheme:c,cssVars:r?void 0:v,themeClass:a==null?void 0:a.themeClass,onRender:a==null?void 0:a.onRender},s)},render(){var e;const{mergedClsPrefix:o,hasSider:t}=this;(e=this.onRender)===null||e===void 0||e.call(this);const l=t?this.hasSiderStyle:void 0,r=[this.themeClass,d&&`${o}-layout-content`,`${o}-layout`,`${o}-layout--${this.position}-positioned`];return b("div",{class:r,style:this.cssVars},this.nativeScrollbar?b("div",{ref:"scrollableElRef",class:`${o}-layout-scroll-container`,style:[this.contentStyle,l],onScroll:this.onScroll},this.$slots):b($,Object.assign({},this.scrollbarProps,{onScroll:this.onScroll,ref:"scrollbarInstRef",theme:this.mergedTheme.peers.Scrollbar,themeOverrides:this.mergedTheme.peerOverrides.Scrollbar,contentStyle:[this.contentStyle,l]}),this.$slots))}})}var _=S(!1),D=S(!0),M=x({setup(d,{slots:e}){return()=>p(_,null,{default:()=>[p(D,{contentStyle:{padding:"10vh 10px 50px 10px",maxWidth:"1295px",overflow:"hidden",margin:"0 auto"}},{default:()=>{var o;return[(o=e.default)==null?void 0:o.call(e)]}})]})}});export{M as L};
