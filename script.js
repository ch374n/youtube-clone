import axios from 'axios';
import dotenv from 'dotenv' 

dotenv.config() 

const videoSection    = document.querySelector('.video-section')
const searchForm      = document.querySelector('.search-bar')
const searchInput     = document.querySelector('.search-input')
const mainVideoEl     = document.querySelector('.main-video')

const youtube = axios.create({
    baseURL: 'https://www.googleapis.com/youtube/v3',
});

console.log(process.env.SECRET_KEY)

async function findVideos(searchTerm) {
    const { data: { items: videos } } = await youtube.get("search", {
      params: {
        part: "snippet",
        maxResults: 5,
        key: process.env.SECRET_KEY,
        type: 'video', 
        q: searchTerm,
      }
    });

    return videos 
}

class Video {
    constructor(video) {
        const { snippet: { title, channelTitle, description, thumbnails }} = video 
        this.id = video.id.videoId
        this.src = `https://www.youtube.com/embed/${this.id}`
        this.title = title 
        this.channelTitle = channelTitle
        this.description = description 
        this.thumbnail = thumbnails.medium.url  
    }

    get sideHTML() {
       return `
         <div class="video-container" data-id="${this.id}">
           <img class="thumbnail-image" src="${this.thumbnail}" />
           <div class="video-side-section">
              <h3>${this.title}</h3>
           </div>
        </div>
        `      
    }

    get mainHTML() {

      return `
        <iframe class="main-image frame" width="100%" height="100%" src="${this.src}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        <div class="video-bottom-section">
           <div class="description">
              <h1 class="maintitle">${this.title}</h1>
              <h2 class="subtitle">${this.channelTitle}</h2>
              <p class="video-desc">${this.description}</p>
           </div>
        </div>
      `

    }
}

function init(searchTerm="javascript") {

   findVideos(searchTerm).then(videos => {
        const allvids = videos.map(video => new Video(video)) 

        // main video 
        mainVideoEl.innerHTML = allvids[0].mainHTML 
        
        // side videos 
        videoSection.innerHTML = allvids.map(video => video.sideHTML).join('')
        const videoContainers = document.querySelectorAll('.video-container')

        // listeners to side videos 
        videoContainers.forEach(el => el.addEventListener('click', function() {
              const { id } = this.dataset 
              const clickedVid = allvids.find(vid => vid.id === id)
              mainVideoEl.innerHTML = clickedVid.mainHTML 
        }))

    }).catch(console.error) 
}

window.addEventListener('DOMContentLoaded', () => {
    init() 
})

searchForm.addEventListener('submit', e => {
    e.preventDefault() 
    init(searchInput.value)
})

