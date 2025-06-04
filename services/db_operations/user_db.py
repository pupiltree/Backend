from pydantic import BaseModel

class UserBase(BaseModel):
    email: str
    name: str
    uid: str

class LoginUser(BaseModel):
    email: str

class RoleUpdate(BaseModel):
    role: str
    grade: str
    section: str

class CodeBind(BaseModel):
    userId: str
    code: str
