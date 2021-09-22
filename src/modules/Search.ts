import { MessageEmbed } from "discord.js";
import * as youtubedl from "youtube-dl-exec";

// Enum for user command input (i.e. search or URL)
enum URL_TYPE {
    VIDEO = 0,
    PLAYLIST = 1,
    ERROR = 2,
}

// Type for URL getter
type UrlInfo = {
    url: string,
    type: URL_TYPE,
}

// Video info type
type VideoInformation = {
    name: string,
    url: string,
    length: number,
    displayLength: string,
    thumbnail: string,
}

// Output type
// Includes output information in message embed and array of video information
type SearchResult = {
    resultInfo: VideoInformation[],
    resultMessage: MessageEmbed,
}

/*
JSON container for all video search functions
Searcher, parser, Url info getter etc.
*/
const SearchHelper = {
    /* 
    Main search function
    Acts as parser to descide where to send information next
    Output (SearchResult) rerouted back through here to caller
    */
    async search(query: string) {
        //Whether URL or search term
        let isUrl:boolean = this.verifyUrl(query);

        //Based on Url result pass to either searcher or Url parser
        //Route the results (Url with link type (Playlist or Video)) back to here
        let queryUrl:UrlInfo;
        if (isUrl === true) {
            queryUrl = this.parseUrl(query);
        } else {
            return await this.searchVideo(query);
        }

        let result:SearchResult;

        //If an error has been encountered
        //TODO add more descriptive error handling
        if (queryUrl.type === URL_TYPE.ERROR) {
            result = {resultInfo: [], resultMessage: new MessageEmbed().setTitle("An error was encountered")};
            return result;
        }

        //With verified url with handle info get video/playlist info
        result = await this.getUrlInfo(queryUrl.url, queryUrl.type);
        return result;
    },

    // Verify whether input is a youtube URL
    verifyUrl(query: string) {
        let verify:RegExp = new RegExp("((^https:\/\/www.youtube.com\/|^www.youtube.com\/|^youtube.com\/)(watch\?|playlist\?))");
        return verify.test(query);
    },

    // Url parser
    // Parses for website, playlist or video etc.
    // Returns a UrlInfo type
    // TODO Add support for spotify
    parseUrl(query: string) {
        //Set default output to error
        let outInfo:UrlInfo = {url: "", type: URL_TYPE.ERROR};
        //Check with RegEx whether video or playlist
        //Checks playlist first because url can reference both video and playlist, but playlist handling must override

        //TODO This seems very fallible, think of a better way
        //? Should we add timecode support? Shouldn't be too hard, timecode contained in URL (&t=[timecode in seconds])
        if (new RegExp("list=").test(query) === true) {
            outInfo = {url: query, type: URL_TYPE.PLAYLIST};
        } else if (new RegExp("v=").test(query) === true) {
            outInfo = {url: query, type: URL_TYPE.VIDEO};
        }
        return outInfo;
    },

    // Search term searcher
    // Gets a Url from a search query, sends to link parser and returns info
    searchVideo(query: string) {
        // Returns a promise due to search call, just use an await in implmentation
        return new Promise<SearchResult>((resolve, reject) => {
            // Call youtubedl with ytsearch param
            youtubedl.default(query, {
                dumpSingleJson: true,
                defaultSearch: "ytsearch:"
            }).then(output => {

                //Move output of youtubedl into return variable (also formatting time)
                let result:SearchResult = {resultInfo: [], resultMessage: new MessageEmbed}
                let out = (output as any).entries[0];
                result.resultInfo.push({
                    name: out.title,
                    url: out.webpage_url,
                    length: out.duration,
                    displayLength: this.formatVideoTime(out.duration),
                    thumbnail: output.thumbnail,
                });
                //Create output message to return
                result.resultMessage.setTitle("Song Added to Queue");
                result.resultMessage.setThumbnail(result.resultInfo[0].thumbnail);
                result.resultMessage.addField(result.resultInfo[0].name, result.resultInfo[0].displayLength);
                result.resultMessage.setURL(result.resultInfo[0].url);

                resolve(result);
            });
        });
    },

    // Get info from url based on handle type
    // Also handles output text for some reason
    // Should probably change that, just need to figure out how to route playlist info out too
    getUrlInfo(query: string, handleType: URL_TYPE) {
        return new Promise<SearchResult>((resolve, reject) => {
            // Call youtubedl search
            youtubedl.default(query, {
                dumpSingleJson: true,
            }).then(output => {
                let result:SearchResult = {resultInfo: [], resultMessage: new MessageEmbed()};
                //Handle output based on handletype
                if (handleType === URL_TYPE.PLAYLIST) { //If handling as playlist
                    //Loop entries and add to return variable
                    let outputPlaylist = (output as any);
                    let playlistDuration:number = 0;
                    for (let i = 0; i < outputPlaylist.entries.length; i++) {
                        let curEntry = outputPlaylist.entries[i];
                        playlistDuration += curEntry.duration;
                        result.resultInfo.push({
                            name: curEntry.title,
                            url: curEntry.webpage_url,
                            length: curEntry.duration,
                            displayLength: this.formatVideoTime(curEntry.duration),
                            thumbnail: curEntry.thumbnail,
                        });
                    }
                    //Create output message
                    result.resultMessage.setTitle("Playlist Added to Queue");
                    result.resultMessage.setThumbnail(result.resultInfo[0].thumbnail);
                    result.resultMessage.addField(output.title, String(this.formatVideoTime(playlistDuration)));
                    result.resultMessage.setURL(output.webpage_url);
                    
                } else if (handleType === URL_TYPE.VIDEO) { //If handling as video
                    //Move output of youtubedl into return variable (also formatting time)
                    result.resultInfo.push({
                        name: output.title,
                        url: output.webpage_url,
                        length: output.duration,
                        displayLength: this.formatVideoTime(output.duration),
                        thumbnail: output.thumbnail,
                    });
                    //Create output message to return
                    result.resultMessage.setTitle("Song Added to Queue");
                    result.resultMessage.setThumbnail(result.resultInfo[0].thumbnail);
                    result.resultMessage.addField(result.resultInfo[0].name, result.resultInfo[0].displayLength);
                    result.resultMessage.setURL(result.resultInfo[0].url);
                } else {

                }

                //Return
                resolve(result);
            });
        });
    },

    // Format video time from seconds to hh:mm:ss, returns in string
    // My own epic math, very proud
    // Ripped straight from old implementation, just made into a function
    formatVideoTime(time: number) {
        //Generate time in hours, minutes and seconds
        let times:number[] = [(time - (time % 3600)) / 3600, (((time % 3600) - (time % 3600) % 60) / 60), (time % 3600) % 60];
        //Convert to strings and add extra 0 where necesary to comply with hh:mm:ss
        let timesStringArr:string[] = [];
        for (let i = 0; i < 3; i++) {
            if (times[i] < 10) {
                timesStringArr.push(String(times[i]));
                timesStringArr[i] = "0" + timesStringArr[i];
            } else {
                timesStringArr.push(String(times[i]));
            }
        }
        let timesString:string = timesStringArr[0] + ":" + timesStringArr[1] + ":" + timesStringArr[2];
        return timesString;
    },
}

export { URL_TYPE, VideoInformation, SearchResult };
export default SearchHelper;