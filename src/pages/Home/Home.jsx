import { useState } from 'react'
import Layout from '../../components/Layout/Layout'
import UploadArea from '../../components/UploadArea/UploadArea'
import ProgressBar from '../../components/ProgressBar/ProgressBar'
import './Home.css'

const Home = () => {
  const [processingStatus, setProcessingStatus] = useState(null)

  return (
    <Layout>
      <div className="home">
        <div className="upload-wrapper">
          <UploadArea />
        </div>

        {processingStatus && (
          <div className="progress-wrapper">
            <ProgressBar status={processingStatus} />
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Home