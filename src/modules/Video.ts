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
    thumbnail: string,
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
        let verify:RegExp = new RegExp("^https://www.youtube.com/|^www.youtube.com/|^youtube.com/");
        return verify.test(url);
    }

    // Get video information from youtube URL
    getVideoFromURL(url: string) {
        return new Promise<VideoInfomation | null>(async (resolve, reject) => {
            try {
                await youtubedl.default(url, {
                    dumpSingleJson: true,
                }).then(output => {
                    //Generate time in hours, minutes and seconds
                    let times:number[] = [(output.duration - (output.duration % 3600)) / 3600, (((output.duration % 3600) - (output.duration % 3600) % 60) / 60), (output.duration % 3600) % 60];
                    //Convert to strings and add extra 0 where necesary to comply with hh:mm:ss
                    let timesString:string[] = [];
                    for (let i = 0; i < 3; i++) {
                        if (times[i] < 10) {
                            timesString.push(String(times[i]));
                            timesString[i] = "0" + timesString[i];
                        } else {
                            timesString.push(String(times[i]));
                        }
                    }
                    
                    this.infomation_ = {
                        name: output.title,
                        url: output.webpage_url,
                        length: timesString[0] + ":" + timesString[1] + ":" + timesString[2],
                        thumbnail: output.thumbnail,
                    }
                    resolve(this.infomation_);
                });
            } catch (e) {
                resolve(null);
            }
        });
    }

    // Get URl of top youtube result for a search term
    // Returns either the string of the first result or if no results returns null
    getURLFromSearch(term: string) {
        return new Promise<string | null>((resolve, reject) => {
            youtubedl.default(term, {
                dumpSingleJson: true,
                defaultSearch: "ytsearch:"
            }).then(output => {
                var outURL:string | null;
                if ((output as any).entries[0] != undefined) {
                    outURL = (output as any).entries[0].webpage_url;
                } else {
                    outURL = null;
                }
                resolve(outURL);
            });
        });
    }

    // Get video info
    async searchVideo() {
        // If not url mark as search
        if (this.verifyURL(this.search_.term) == false) {
            this.search_.type = INPUT_TYPE.SEARCH;
        }

        //If type URL
        if (this.search_.type == INPUT_TYPE.URL) {
            //Just use URL
            return this.getVideoFromURL(this.search_.term);
        } else {
            //Search for URL first, then return
            let actualURL:string | null = await this.getURLFromSearch(this.search_.term);
            //If returns null (no results found) pass on null information value for handling
            if (actualURL != null) {
                return this.getVideoFromURL(actualURL as string);
            } else {
                return this.infomation_;
            }
        }
    }

    // Get video info
    get infomation() {
        return this.infomation_;
    }

    // Get search param info
    get search() {
        return this.search_;
    }
}

export { INPUT_TYPE, VideoInfomation };
export default Video;