import { fromUnixTime } from "date-fns";
import format from "date-fns/format";
import * as youtubedl from "youtube-dl-exec";

// Enum for user command input (i.e. search or URL)
enum INPUT_TYPE {
    URL = 0,
    SEARCH = 1,
}

// Video info type
type VideoInfomation = {
    name: string,
    url: string,
    length: string,
}

// Search information type
type SearchParams = {
    term: string,
    type: INPUT_TYPE
}

class Video {
    // When referencing video information, always wrap in a !null if
    private infomation_: VideoInfomation | null = null;
    private search_: SearchParams;
    
    constructor(term: string, type: INPUT_TYPE) {
        this.search_ = {term: term, type: type};      
    }

    // Verify whether input is a youtube URL
    verifyURL(url: string) {
        let verify:RegExp = new RegExp("^https://www.youtube.com|^www.youtube.com|^youtube.com");
        return verify.test(url);
    }

    getVideoFromURL(url: string) {
        return new Promise<VideoInfomation>((resolve, reject) => {
            youtubedl.default(this.search_.term, {
                dumpSingleJson: true,
            }).then(output => {
                this.infomation_ = {
                    name: output.title,
                    url: output.webpage_url,
                    length: format(fromUnixTime(output.duration), "m:ss"),
                }
                resolve(this.infomation_);
            });
        })
    }

    // Get video info
    searchVideo() {

        // If not url mark as search
        if (this.verifyURL(this.search_.term) == false) {
            this.search_.type = INPUT_TYPE.SEARCH;
        }

        //If type URL
        if (this.search_.type == INPUT_TYPE.URL) {
            console.log("search type: url");
            //Just use URL
            return this.getVideoFromURL(this.search_.term);

        } else {

            console.log("search type: search");
            //Search for first result, then use that URL
            youtubedl.default(this.search_.term, {
                dumpSingleJson: true,
                defaultSearch: "ytsearch:"
            }).then(output => {
                this.search_.term = output.url;
                console.log(output.url);
                return this.getVideoFromURL(this.search_.term);
            });
        }
        
    }

    // Get video info
    get infomation() {
        return this.infomation_;
    }
}

export { INPUT_TYPE, VideoInfomation };
export default Video;