let videoChangedButUnsync;

function doPostSyncTask(syncSession, {sessionId, syncOffset, serverDate, youtubeData, lastYoutubeData, userOffsetMs = 0, forceOffseting}) {
    // console.log("doPostSyncTask: ", sessionId, serverDate, youtubeData);
    const videoChanged = selectVideoPlaying(youtubeData, lastYoutubeData[0], sessionId);
    videoChangedButUnsync = videoChanged;
    videoChangedButUnsync =
        synchronizeVideoPlaying({videoChangedButUnsync, serverDate, syncOffset, youtubeData, userOffsetMs});
}

function selectVideoPlaying(youtubeData, lastYoutubeData, sessionId) {
    if (!window.location.href.includes(youtubeData.url)) {
        console.log("setting new yt url: ", `${window.location.host}${youtubeData.url}`);
        window.location.href = `${window.orgLocationOrigin}${youtubeData.url}&syncId=${sessionId}`;
        return true;
    }
    return false;
}

const maxMsTolerance = 250;

function synchronizeVideoPlaying({videoChangedButUnsync, serverDate, syncOffset, youtubeData, userOffsetMs, forceOffseting}) {
    const videoEl = document.querySelector(".html5-main-video");
    if (videoEl) {
        const curDate = new Date();
        const timePassedSinceSyncBroadcast = (curDate.valueOf() + syncOffset) - serverDate;
        const idealYTOffsetNow = youtubeData.videoOffset + (timePassedSinceSyncBroadcast / 1000);
        console.log("idealYTOffsetNow: ", idealYTOffsetNow);
        if (videoChangedButUnsync) {
            console.log("videoChangedButUnsync, set:", idealYTOffsetNow + 5000, userOffsetMs);
            setCurrentTimeAhead(videoEl, idealYTOffsetNow, 5000, userOffsetMs);
            return false;
        } else {
            const myToIdealDiff = Math.abs(idealYTOffsetNow - videoEl.currentTime);
            console.log("myToIdealDiff:", myToIdealDiff);
            if (myToIdealDiff > (maxMsTolerance / 1000) || forceOffseting) {
                console.log("Setting new offset!!!", idealYTOffsetNow, userOffsetMs);
                setCurrentTimeAhead(videoEl, idealYTOffsetNow, 1800, userOffsetMs);
            }
        }
    }
}

function setCurrentTimeAhead(videoEl, targetTime, aheadMs = 1500, userOffsetMs) {
    console.log("curTime(Ahead-pre): " + videoEl.currentTime);
    videoEl.pause();
    videoEl.currentTime = targetTime + (aheadMs / 1000) + (userOffsetMs / 1000);

    console.log("curTime(Ahead): ", `${targetTime} + ${aheadMs / 1000} + ${(userOffsetMs / 1000)} = ${videoEl.currentTime}`)
    setTimeout(() => {
        videoEl.play();
        console.log("curTime(Ahead-start): " + videoEl.currentTime);
    }, aheadMs);
}

export default doPostSyncTask;