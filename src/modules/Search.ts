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
    thumbnail: string | null,
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
            result = {resultInfo: [], resultMessage: new MessageEmbed().setTitle("An error was encountered").setDescription("URL didn't meet the creiteria for a Playlist or Video")};
            return result;
        }

        //With verified url with handle info get video/playlist info
        result = await this.getUrlInfo(queryUrl.url, queryUrl.type);
        return result;
    },

    // Verify whether input is a youtube URL
    verifyUrl(query: string) {
        // Shortened
        if(new RegExp("(https:\/\/|^|^)(youtu.be\/)").test(query) == true) {
            return true;
        // Normal
        } else if(new RegExp("((^https:\/\/www.youtube.com\/|^www.youtube.com\/|^youtube.com\/)(watch\?|playlist\?))").test(query)) {
            return true;
        } else {
            return false;
        }
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
        
        
        if (new RegExp("(?=.*v=)(?=.*list=)").test(query)) {
            outInfo = {url: query, type: URL_TYPE.PLAYLIST};
        } else if(new RegExp("(playlist\\?list)").test(query)) {
            outInfo = {url: query, type: URL_TYPE.PLAYLIST};
        } else if(new RegExp("(watch\\?v)").test(query)) {
            outInfo = {url: query, type: URL_TYPE.VIDEO};
        } else if(new RegExp("(https:\/\/|^|^)(youtu.be\/)").test(query)) {
            outInfo = {url: query, type: URL_TYPE.VIDEO};
        } else {
            outInfo = {url: query, type: URL_TYPE.ERROR};
        }

        return outInfo;
        /*if (new RegExp("v=").test(query) === true) {
            outInfo = {url: query, type: URL_TYPE.VIDEO};
        } else if(new RegExp("(v=)(index=)").test(query) === true) {

        } else if (new RegExp("list=").test(query) === true) {
            outInfo = {url: query, type: URL_TYPE.PLAYLIST};
        } else if (new RegExp("(https:\/\/|^|^)(youtu.be\/)").test(query) === true) {
            outInfo = {url: query, type: URL_TYPE.VIDEO};
        }
        return outInfo;*/
    },

    // Search term searcher
    // Gets a Url from a search query, sends to link parser and returns info
    searchVideo(query: string) {
        // Returns a promise due to search call, just use an await in implmentation
        return new Promise<SearchResult>(async (resolve, reject) => {
            console.log(query);
            // Call youtubedl with ytsearch param
            await youtubedl.default(query, {
                dumpSingleJson: true,
                defaultSearch: "ytsearch:"
            }).then(output => {
                let result:SearchResult = {resultInfo: [], resultMessage: new MessageEmbed};
                if ((output as any).entries.length > 0) {
                    //Move output of youtubedl into return variable (also formatting time)
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
                    if(result.resultInfo[0].thumbnail != null) {
                        result.resultMessage.setThumbnail(result.resultInfo[0].thumbnail);
                    }
                    result.resultMessage.addField(result.resultInfo[0].name, result.resultInfo[0].displayLength);
                    result.resultMessage.setURL(result.resultInfo[0].url);
                } else {
                    result.resultMessage.setTitle("No Results Found");    
                }
                resolve(result);
            }).catch((error) => {
                console.log(error);
                let result:SearchResult = {resultInfo: [], resultMessage: new MessageEmbed()};
                result.resultMessage.setTitle("An Error was Encountered");
                result.resultMessage.setDescription("Video search failed. Double check the link is in the normal format and try again");
                resolve(result);
            });
            
            
        });
    },

    // Get info from url based on handle type
    // Also handles output text for some reason
    // Should probably change that, just need to figure out how to route playlist info out too
    getUrlInfo(query: string, handleType: URL_TYPE) {
        return new Promise<SearchResult>(async (resolve, reject) => {
            try {
                console.log(query);
                // Call youtubedl search
                await youtubedl.default(query, {
                    dumpSingleJson: true,
                    flatPlaylist: true
                }).then(output => {
                    let result:SearchResult = {resultInfo: [], resultMessage: new MessageEmbed()};
                    //Handle output based on handletype
                    if (handleType === URL_TYPE.PLAYLIST) { //If handling as playlist
                        let outputPlaylist = (output as any);
                        let playlistDuration:number = 0;
                        for(let i = 0; i < outputPlaylist.entries.length; i++) {
                            let curEntry = outputPlaylist.entries[i];
                            playlistDuration += curEntry.duration;

                            result.resultInfo.push({
                                name: curEntry.title,
                                url: "https://youtube.com/watch?v=" + curEntry.url,
                                length: curEntry.duration,
                                displayLength: this.formatVideoTime(curEntry.duration),
                                thumbnail: null,
                            });
                        }
                        
                        //Create output message
                        result.resultMessage.setTitle("Playlist Added to Queue");
                        result.resultMessage.addField(output.title, String(this.formatVideoTime(playlistDuration)));
                        result.resultMessage.setURL(query);
                        
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
                        if(result.resultInfo[0].thumbnail != null) { // Could be null if it's a playlist
                            result.resultMessage.setThumbnail(result.resultInfo[0].thumbnail);
                        }
                        result.resultMessage.addField(result.resultInfo[0].name, result.resultInfo[0].displayLength);
                        result.resultMessage.setURL(result.resultInfo[0].url);
                    } else {
                        result.resultMessage.setTitle("An Error was Encountered");
                    }
                    resolve(result);
                });
            } catch (e) {
                console.log(e);
                let result:SearchResult = {resultInfo: [], resultMessage: new MessageEmbed()};
                if (new RegExp("Sign in to confirm your age").test((e as any).stderr)) {
                    result.resultMessage.setTitle("Video is Age-Restricted, Unable to Play");
                } else {
                    result.resultMessage.setTitle("An Error was Encountered");
                }
                resolve(result);
            }
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