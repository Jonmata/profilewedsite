let Pages = document.querySelectorAll('.slider .page');
let prevBtn = document.getElementById('prev');
let nextBtn = document.getElementById('next');
let lastPostion = Pages.length-1;
let firstPostion =0;
let active =0;

nextBtn.onclick = () =>{
    active++;
    setSlider();
}
prevBtn.onclick = ()=>{
    active--;
    setSlider();
}

document.getElementById('AboutButton').onclick = () =>{
    window.location.href = 'aboutMe.html';
}

document.getElementById('BlogButton').onclick = ()=>{
    window.location.href = 'blog.html';
}
document.getElementById('projectButton').onclick = ()=>{
    window.location.href = 'Projects.html';
}

const setSlider = () =>{
    let oldActive= document.querySelector('.slider .page.active');
    if(oldActive != null) oldActive.classList.remove('active');
    Pages[active].classList.add('active');

    nextBtn.classList.remove('d-none');
    prevBtn.classList.remove('d-none');

    if(active == lastPostion) nextBtn.classList.add('d-none');
    if(active == firstPostion) prevBtn.classList.add('d-none');
}

const setDiameter = ()=>{
    let slider = document.querySelector('.slider');
    let widthSlider = slider.offsetWidth;
    let heightSlider = slider.offsetHeight;
    let diameter = Math.sqrt(Math.pow(widthSlider,2)+Math.pow(heightSlider,2));
    document.documentElement.style.setProperty('--diameter', diameter+'px');
}

// sidebar logic
document.getElementById('Home').addEventListener('click', function(){
    if(active != 0){
        active =0; 
    }
    setSlider();
});
document.getElementById('AboutMe').addEventListener('click', function(){
    if(active != 1){
        active =1; 
    }
    setSlider();
});
document.getElementById('Blog').addEventListener('click', function(){
    if(active != 2){
        active =2; 
    }
    setSlider();
});
document.getElementById('Projects').addEventListener('click', function(){
    if(active != 3){
        active =3; 
    }
    setSlider();
});
document.getElementById('openSidebar').addEventListener('click', function() {
    document.getElementById('sidebar').classList.add('open');
});

document.getElementById('closeSidebar').addEventListener('click', function() {
    document.getElementById('sidebar').classList.remove('open');
});

setDiameter();
setSlider();
window.addEventListener('resize',setDiameter);