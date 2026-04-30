export function loginUser(email, password) {

    const users = JSON.parse(localStorage.getItem("users")) || []

    const user = users.find(
        (u) => u.email === email && u.password === password
    )

    if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user))
        return user
    }

    return null
}

export function logoutUser() {
    localStorage.removeItem("currentUser")
}

export function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"))
}