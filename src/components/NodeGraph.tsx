import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Float } from "@react-three/drei";
import { Vector3 } from "three";
import * as THREE from "three";

type Topic = {
  title: string;
  description: string;
};

type Props = {
  nodes: Topic[];
  onNodeClick: (topic: Topic) => void;
};

const randomPosition = () => {
  const radius = 5 + Math.random() * 10;
  const angle1 = Math.random() * Math.PI * 2;
  const angle2 = Math.random() * Math.PI * 2;
  return new Vector3(
    radius * Math.cos(angle1),
    radius * Math.sin(angle1),
    radius * Math.cos(angle2)
  );
};

const Node = ({
  topic,
  position,
  onClick,
}: {
  topic: Topic;
  position: Vector3;
  onClick: () => void;
}) => {
  const ref = useRef<THREE.Mesh>(null);

  return (
    <Float speed={2} floatIntensity={2} rotationIntensity={1}>
      <mesh position={position} ref={ref} onClick={onClick}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color={"#ff5cf4"} emissive="#441155" />
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {topic.title}
        </Text>
      </mesh>
    </Float>
  );
};

const NodeGraph = ({ nodes, onNodeClick }: Props) => {
  return (
    <Canvas camera={{ position: [0, 0, 20], fov: 45 }}>
      <ambientLight intensity={1.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls enablePan={false} />
      {nodes.map((node, i) => (
        <Node
          key={i}
          topic={node}
          position={randomPosition()}
          onClick={() => onNodeClick(node)}
        />
      ))}
    </Canvas>
  );
};

export default NodeGraph;
