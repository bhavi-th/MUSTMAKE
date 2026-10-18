window.redirectAfterAuthentication = function (user) {
    const destination = user?.age !== null && user?.age !== undefined
        ? "/today"
        : "/first-details";

    window.location.replace(destination);
};
