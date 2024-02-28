exports.transformTimelineImages = (timelineImages = []) => {
    return timelineImages.map(({ _doc }) => ({
        ..._doc,
        userName: _doc.user.userName,
        userPhoto: _doc.user.photo,
        likedBy: _doc.likedBy.map(({ _doc: likedByDoc }) => ({
            ...likedByDoc,
            userName: likedByDoc.user.userName,
            userPhoto: likedByDoc.user.photo,
        })),
        commentSection: _doc.commentSection.map(({ _doc: commentDoc }) => ({
            ...commentDoc,
            userName: commentDoc.user.userName,
            userPhoto: commentDoc.user.photo,
        }))
    }));
}