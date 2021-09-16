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

    // Get video info
    // Not search, only gets from URL
    searchVideo() {
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
    get infomation() {
        return this.infomation_;
    }
}

export { INPUT_TYPE, VideoInfomation };
export default Video;