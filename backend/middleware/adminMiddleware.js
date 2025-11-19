export const verifyAdmin = (req, res, next) => {
    // Middleware này CHỈ cho phép 'admin'
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Yêu cầu quyền Admin.' });
    }
};

export const verifyEmployee = (req, res, next) => {
    // Middleware này cho phép cả 'employee' và 'admin'
    if (req.user && (req.user.role === 'employee' || req.user.role === 'admin')) {
        next(); // Nếu đúng vai trò, cho đi tiếp
    } else {
        res.status(403).json({ message: 'Yêu cầu quyền Nhân viên để thực hiện hành động này.' });
    }
};