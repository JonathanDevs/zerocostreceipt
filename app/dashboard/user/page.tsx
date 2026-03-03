import Link from "next/link"
import BackButton from "@/app/components/BackButton"

const User = () => {
    return (
        <div className="p-4">
            <BackButton />
            <h1 className="text-2xl font-bold mb-4">Dashboard User</h1>
            <ul className="userList mt-10">
                <li><Link href="/dashboard/user/1">User 1</Link></li>
                <li><Link href="/dashboard/user/2">User 2</Link></li>
                <li><Link href="/dashboard/user/3">User 3</Link></li>
            </ul>
        </div>
    )
}

export default User