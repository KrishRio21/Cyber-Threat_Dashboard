import { useParams } from 'react-router-dom';
    import ThreatCard from '../components/ThreatCard';
    import { Container } from 'react-bootstrap';

    function IPDetails() {
      const { ip } = useParams();
      return (
        <Container className="mt-4">
          <h1 className="mb-4 text-center">IP Details</h1>
          <ThreatCard ip={ip} />
        </Container>
      );
    }

    export default IPDetails;