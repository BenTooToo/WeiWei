const story=document.querySelector('.hero-scroll');
const heroName=document.querySelector('.artist-name');
const navName=document.querySelector('.nav-name');
const statistics=document.querySelector('.journey-stats');
const clamp01=value=>Math.max(0,Math.min(1,value));
let scrollScheduled=false;
function updateStory(){
 const travel=Math.max(1,story.offsetHeight-(window.innerHeight-64));
 const progress=clamp01((window.scrollY-story.offsetTop+64)/travel);
 const titleOpacity=1-clamp01(progress/.43);
 const navOpacity=clamp01((progress-.035)/.38);
 const statsOpacity=clamp01((progress-.25)/.35);
 const style=document.documentElement.style;
 style.setProperty('--intro-opacity',titleOpacity.toFixed(3));
 style.setProperty('--nav-name-opacity',navOpacity.toFixed(3));
 style.setProperty('--stats-opacity',statsOpacity.toFixed(3));
 heroName.setAttribute('aria-hidden',String(titleOpacity<.1));
 navName.setAttribute('aria-hidden',String(navOpacity<.15));
 navName.tabIndex=navOpacity<.15?-1:0;
 navName.classList.toggle('is-visible',navOpacity>=.15);
 statistics.setAttribute('aria-hidden',String(statsOpacity<.1));
 scrollScheduled=false;
}
function scheduleStory(){if(!scrollScheduled){scrollScheduled=true;requestAnimationFrame(updateStory);}}
window.addEventListener('scroll',scheduleStory,{passive:true});
window.addEventListener('resize',scheduleStory);
window.addEventListener('pageshow',scheduleStory);
navName.addEventListener('click',event=>{event.preventDefault();closeMenus();menuButton.focus({preventScroll:true});window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
updateStory();
