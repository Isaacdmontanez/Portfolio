import '../css/home.css'
import writingSample from '../text/writingSample.pdf'
import sortingDocumentation from '../text/sortingDocumentation.pdf'
import graphingDocumentation from '../text/graphingDocumentation.pdf'
import chessDocumentation from '../text/chessDocumentation.pdf'

export default function Home (){
    let linkedInUrl = "https://www.linkedin.com/in/isaac-montanez/", gitHubUrl = "https://github.com/Isaacdmontanez/Portfolio";
    return(
        <div id = "homeDiv">
            <div id = "homeInnerDisplay">
                <p className = "homeIntro" id = "homeHiText">Hi, I'm Isaac!</p>
                <p className = "homeIntro" id = "homeMainText">I'm a software engineer and I love to code. This website showcases some of my favorite personal projects. Please note this website is not designed to work on mobile devices. </p>
            </div>    
            <div id = "homeLinksBox">
                <p className = "homeLinkText">View My:</p>
                <a href = {gitHubUrl}     target = "_blank" rel="noreferrer" className = "homeLinks" id = "homeGithubLink">Github</a>
                <a href = {writingSample} target = "_blank" rel="noreferrer" className = "homeLinks" id = "homeWritingSampleLink">Writing Sample</a>
                <a href = {linkedInUrl}   target = "_blank" rel="noreferrer" className = "homeLinks" id = "homeLinkedInLink">LinkedIn</a>
            </div>
            <div id = "homeDocumentationBox">
                <p className = "homeLinkText">Documentation For:</p>
                <a href = {chessDocumentation}    target = "_blank" rel = "noreferrer" className = "homeDocumentation" id = "homeChessDocumentation">Chess</a>
                <a href = {graphingDocumentation} target = "_blank" rel = "noreferrer" className = "homeDocumentation" id = "homeGraphingDocumentation">Graphing</a>
                <a href = {sortingDocumentation}  target = "_blank" rel = "noreferrer" className = "homeDocumentation" id = "homeSortingDocumentation" >Sorting</a>
            </div>
        </div>
    );
}