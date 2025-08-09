import axios from "axios"

export class XKCDService {
  static async getLatestComic() {
    try {
      const response = await axios.get("https://xkcd.com/info.0.json")
      return response.data
    } catch (error) {
      console.error("Error fetching latest XKCD comic:", error)
      throw error
    }
  }

  static async getRandomComic() {
    try {
      // First get the latest comic to know the range
      const latest = await this.getLatestComic()
      const randomNum = Math.floor(Math.random() * latest.num) + 1

      const response = await axios.get(`https://xkcd.com/${randomNum}/info.0.json`)
      return response.data
    } catch (error) {
      console.error("Error fetching random XKCD comic:", error)
      // Fallback to latest comic
      return await this.getLatestComic()
    }
  }

  static formatComicEmail(comic) {
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #333; text-align: center;">📚 Daily XKCD Comic</h1>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #2c3e50; text-align: center;">${comic.title}</h2>
          <p style="text-align: center; color: #666;">Comic #${comic.num} • ${comic.day}/${comic.month}/${comic.year}</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <img src="${comic.img}" alt="${comic.alt}" style="max-width: 100%; height: auto; border-radius: 5px;">
          </div>
          
          <div style="background: #fff; padding: 15px; border-radius: 5px; margin-top: 15px;">
            <p style="color: #555; font-style: italic; margin: 0;"><strong>Alt text:</strong> ${comic.alt}</p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px;">
            You're receiving this because you subscribed to daily XKCD comics.<br>
            <a href="https://xkcd.com/${comic.num}" style="color: #3498db;">View on XKCD.com</a>
          </p>
        </div>
      </div>
    `
  }
}
