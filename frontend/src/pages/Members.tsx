import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Member {
  id: number;
  firstName: string;
  lastName: string;
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const response = await fetch("/api/members_api/");
      const data = await response.json();
      setMembers(data);
    };

    fetchMembers();
  }, []);

  return (
    <div>
      <h1>Members</h1>

      <ul>
        {members.map((member) => (
          <li key={member.id}>
            <Link to={`/members/details/${member.id}`}>
              {member.firstName} {member.lastName}
            </Link>
          </li>
        ))}
      </ul>

      <p>
        <Link to="/">HOME</Link>
      </p>
    </div>
  );
}
