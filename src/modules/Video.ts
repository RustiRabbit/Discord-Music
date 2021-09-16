import { fromUnixTime } from "date-fns";
import format from "date-fns/format";
import * as youtubedl from "youtube-dl-exec";

enum INPUT_TYPE {
    URL = 0,
    SEARCH = 1,
}

type VideoInfomation = {
    name: string,
    url: string,
    length: string,
}

type SearchParams = {
    term: string,
    type: INPUT_TYPE
}

class Video {
    private infomation_: VideoInfomation | null = null;
    private search_: SearchParams;
    
    constructor(term: string, type: INPUT_TYPE) {
        this.search_ = {term: term, type: type};      
    }

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

    get infomation() {
        return this.infomation_;
    }
}

export { INPUT_TYPE, VideoInfomation };
export default Video;