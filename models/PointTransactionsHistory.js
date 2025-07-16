import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserPointsHistory } from '../redux/slices/userSlice';
import { useParams } from 'react-router-dom';
import { GrTransaction } from "react-icons/gr";
import { GiTwoCoins } from "react-icons/gi";
import { FaRegIdCard } from "react-icons/fa";

const UserPointsTxnHistoryList = () => {
  const dispatch = useDispatch();
  const { id } = useParams();

  const { pointsHistory, loading } = useSelector((state) => state.users);
  const transactions = pointsHistory?.data || [];
  const points = pointsHistory?.points || 0;
  const referralCode = pointsHistory?.referralCode || 'N/A';

  useEffect(() => {
    if (id) {
      dispatch(getUserPointsHistory(id));
    }
  }, [dispatch, id]);

  const totalRedeemedPoints = transactions
    .filter((t) => t.type === 'redeem')
    .reduce((sum, item) => sum + item.deductedPoints, 0);

  const getBadgeClass = (type) => {
    switch (type) {
      case 'referral': return 'bg-primary';
      case 'redeem': return 'bg-danger';
      case 'quote': return 'bg-warning';
      default: return 'bg-secondary';
    }
  };

  const getPointPrefix = (type) => type === 'redeem' ? '-' : '+';

  return (
    <div className="container mt-4">

      {/* 🔹 Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center border-success shadow-sm">
            <div className="card-body">
              <div className="fw-bold fs-5 text-success"><GiTwoCoins className='cardicon' /> {points}</div>
              <div className="text-muted small">Total Points</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center border-primary shadow-sm">
            <div className="card-body">
              <div className="fw-bold fs-5 text-primary"><FaRegIdCard className='cardicon' /> {referralCode}</div>
              <div className="text-muted small">Referral Code</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center border-dark shadow-sm">
            <div className="card-body">
              <div className="fw-bold fs-5 text-dark"><GrTransaction className='cardicon' /> {transactions.length}</div>
              <div className="text-muted small">Total Transactions</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center border-danger shadow-sm">
            <div className="card-body">
              <div className="fw-bold fs-5 text-danger">🔻 {totalRedeemedPoints}</div>
              <div className="text-muted small">Redeem Points Used</div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 Points Table */}
      <div className="card mt-40">
        <div className="card-header bg-primary text-white">
          <h6 className="mb-0 text-white">User Points History</h6>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <p className="p-3">Loading...</p>
          ) : transactions.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-bordered mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Description</th>
                    <th>Points</th>
                    <th>Type</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((item, index) => (
                    <tr key={item._id}>
                      <td>{index + 1}</td>
                      <td>{item.description}</td>
                      <td>
                        <strong className={item.type === 'redeem' ? 'text-danger' : 'text-success'}>
                          {getPointPrefix(item.type)}{item.deductedPoints}
                        </strong>
                      </td>
                      <td>
                        <span className={`badge ${getBadgeClass(item.type)}`}>
                          {item.type}
                        </span>
                      </td>
                      <td>{new Date(item.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-3 mb-0">No history available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPointsTxnHistoryList;
