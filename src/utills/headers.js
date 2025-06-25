export const headersApplication = async() => {
    try {
        const headres = {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem("Auth")
        }
        return headres;
    } catch (error) {
        console.log(error)
    }
}

export const headersMultipart = async() => {
    try {
        const headres = {
            'Content-Type': 'multipart/form-data',
            Authorization: localStorage.getItem("Auth")
        }
        return headres;
    } catch (error) {
        console.log(error)
    }
}

